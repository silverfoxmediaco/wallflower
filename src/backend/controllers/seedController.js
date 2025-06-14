// Seed Controller
// Path: src/backend/controllers/seedController.js
// Purpose: Handle seed-related operations and Stripe integration

const User = require('../models/User');
const SeedTransaction = require('../models/SeedTransaction');
const stripe = require('../config/stripe');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
 const token = req.headers.authorization?.split(' ')[1];
 
 if (!token) {
   return res.status(401).json({ success: false, message: 'No token provided' });
 }
 
 try {
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   req.userId = decoded.userId;
   next();
 } catch (error) {
   return res.status(401).json({ success: false, message: 'Invalid token' });
 }
};

// Create Stripe subscription
exports.createSubscription = [verifyToken, async (req, res) => {
 try {
   const user = await User.findById(req.userId);
   
   if (!user) {
     return res.status(404).json({ 
       success: false, 
       message: 'User not found' 
     });
   }
   
   // Check if user already has active subscription
   if (user.subscription && user.subscription.status === 'active') {
     return res.status(400).json({ 
       success: false, 
       message: 'You already have an active subscription' 
     });
   }
   
   // Create or retrieve Stripe customer
   let customerId = user.stripeCustomerId;
   
   if (!customerId) {
     const customer = await stripe.customers.create({
       email: user.email,
       metadata: {
         userId: user._id.toString(),
         username: user.username
       }
     });
     
     customerId = customer.id;
     user.stripeCustomerId = customerId;
     await user.save();
   }
   
   // Create checkout session for subscription using price_data
   const session = await stripe.checkout.sessions.create({
     customer: customerId,
     payment_method_types: ['card'],
     line_items: [
       {
         price_data: {
           currency: 'usd',
           product_data: {
             name: 'Unlimited Seeds Membership',
             description: 'Unlimited seeds every month. Send as many connections as you want.'
           },
           unit_amount: 2999, // $29.99 in cents
           recurring: {
             interval: 'month'
           }
         },
         quantity: 1,
       },
     ],
     mode: 'subscription',
     success_url: `${process.env.CLIENT_URL}/profile?subscription=success`,
     cancel_url: `${process.env.CLIENT_URL}/profile?subscription=cancelled`,
     metadata: {
       userId: req.userId
     }
   });
   
   res.json({ 
     success: true, 
     url: session.url,
     sessionId: session.id 
   });
 } catch (error) {
   console.error('Create subscription error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to create subscription' 
   });
 }
}];

// Cancel subscription
exports.cancelSubscription = [verifyToken, async (req, res) => {
 try {
   const user = await User.findById(req.userId);
   
   if (!user || !user.subscription || !user.subscription.stripeSubscriptionId) {
     return res.status(404).json({ 
       success: false, 
       message: 'No active subscription found' 
     });
   }
   
   // Cancel at period end (user keeps access until end of billing period)
   const subscription = await stripe.subscriptions.update(
     user.subscription.stripeSubscriptionId,
     { cancel_at_period_end: true }
   );
   
   // Update user record
   user.subscription.cancelAtPeriodEnd = true;
   await user.save();
   
   res.json({
     success: true,
     message: 'Subscription will be cancelled at the end of the billing period',
     endsAt: new Date(subscription.current_period_end * 1000)
   });
 } catch (error) {
   console.error('Cancel subscription error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to cancel subscription' 
   });
 }
}];

// Get seed data
exports.getSeedData = [verifyToken, async (req, res) => {
 try {
   const user = await User.findById(req.userId).select('seeds username subscription');
   
   if (!user) {
     return res.status(404).json({ 
       success: false, 
       message: 'User not found' 
     });
   }
   
   // Check if user has active subscription
   const hasActiveSubscription = user.subscription && 
     user.subscription.status === 'active' && 
     (!user.subscription.cancelAtPeriodEnd || new Date(user.subscription.currentPeriodEnd) > new Date());
   
   // Get recent seed transactions (last 10)
   const history = await SeedTransaction.find({ userId: req.userId })
     .sort({ createdAt: -1 })
     .limit(10)
     .populate('relatedUser', 'username');
   
   // Format history for frontend
   const formattedHistory = history.map(transaction => ({
     _id: transaction._id,
     action: transaction.type,
     amount: transaction.amount,
     change: transaction.change,
     balance: transaction.balanceAfter,
     createdAt: transaction.createdAt,
     recipientName: transaction.type === 'sent' && transaction.relatedUser ? 
       transaction.relatedUser.username : null,
     senderName: transaction.type === 'received' && transaction.relatedUser ? 
       transaction.relatedUser.username : null,
     description: transaction.description
   }));
   
   res.json({
     success: true,
     balance: user.seeds.available,
     history: formattedHistory,
     hasActiveSubscription: hasActiveSubscription,
     subscriptionEndDate: hasActiveSubscription ? user.subscription.currentPeriodEnd : null
   });
 } catch (error) {
   console.error('Get seed data error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to retrieve seed data' 
   });
 }
}];

// Get detailed seed transaction history
exports.getSeedHistory = [verifyToken, async (req, res) => {
 try {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 20;
   const skip = (page - 1) * limit;
   
   const totalCount = await SeedTransaction.countDocuments({ userId: req.userId });
   
   const history = await SeedTransaction.find({ userId: req.userId })
     .sort({ createdAt: -1 })
     .skip(skip)
     .limit(limit)
     .populate('relatedUser', 'username');
   
   res.json({
     success: true,
     history: history,
     pagination: {
       currentPage: page,
       totalPages: Math.ceil(totalCount / limit),
       totalItems: totalCount,
       itemsPerPage: limit
     }
   });
 } catch (error) {
   console.error('Get seed history error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to retrieve seed history' 
   });
 }
}];

// Create Stripe checkout session
exports.createCheckoutSession = [verifyToken, async (req, res) => {
 try {
   const { packageId, seeds, amount } = req.body;
   
   // Validate package
   const validPackages = {
     starter: { seeds: 5, price: 499 },
     bloom: { seeds: 15, price: 999 },
     garden: { seeds: 30, price: 1499 },
     meadow: { seeds: 60, price: 2499 }
   };
   
   if (!validPackages[packageId]) {
     return res.status(400).json({ 
       success: false, 
       message: 'Invalid package selected' 
     });
   }
   
   const selectedPackage = validPackages[packageId];
   
   // Verify price matches
   if (selectedPackage.seeds !== seeds || selectedPackage.price !== Math.round(amount * 100)) {
     return res.status(400).json({ 
       success: false, 
       message: 'Package details do not match' 
     });
   }
   
   // Package names and descriptions
   const packageInfo = {
     starter: {
       name: 'Starter Pack',
       description: 'Perfect for trying out Wallflower'
     },
     bloom: {
       name: 'Bloom Bundle',
       description: 'Most popular choice for making connections'
     },
     garden: {
       name: 'Garden Pack',
       description: 'Best value for regular users'
     },
     meadow: {
       name: 'Meadow Bundle',
       description: 'For the serious gardener'
     }
   };
   
   // Create Stripe checkout session with price_data
   const session = await stripe.checkout.sessions.create({
     payment_method_types: ['card'],
     line_items: [
       {
         price_data: {
           currency: 'usd',
           product_data: {
             name: `${packageInfo[packageId].name} - ${seeds} Seeds`,
             description: packageInfo[packageId].description,
             images: ['https://www.wallflower.me/seed-icon.png'] // Add your seed icon URL if you have one
           },
           unit_amount: selectedPackage.price, // Price in cents
         },
         quantity: 1,
       },
     ],
     mode: 'payment',
     success_url: `${process.env.CLIENT_URL}/profile?payment=success&seeds=${seeds}`,
     cancel_url: `${process.env.CLIENT_URL}/profile?payment=cancelled`,
     metadata: {
       userId: req.userId,
       packageId: packageId,
       seeds: seeds.toString()
     }
   });
   
   res.json({ 
     success: true, 
     url: session.url,
     sessionId: session.id 
   });
 } catch (error) {
   console.error('Create checkout session error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to create checkout session' 
   });
 }
}];

// Handle Stripe webhook
exports.handleStripeWebhook = async (req, res) => {
 const sig = req.headers['stripe-signature'];
 const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
 
 let event;
 
 try {
   // Verify webhook signature
   event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
 } catch (error) {
   console.error('Webhook signature verification failed:', error);
   return res.status(400).send(`Webhook Error: ${error.message}`);
 }
 
 // Handle the event
 switch (event.type) {
   case 'checkout.session.completed':
     const session = event.data.object;
     
     try {
       if (session.mode === 'subscription') {
         // Handle subscription creation
         const subscription = await stripe.subscriptions.retrieve(session.subscription);
         const userId = session.metadata.userId;
         
         await User.findByIdAndUpdate(userId, {
           subscription: {
             stripeSubscriptionId: subscription.id,
             stripeCustomerId: subscription.customer,
             status: subscription.status,
             currentPeriodEnd: new Date(subscription.current_period_end * 1000),
             cancelAtPeriodEnd: subscription.cancel_at_period_end
           }
         });
         
         // Create transaction record
         await SeedTransaction.create({
           userId: userId,
           type: 'purchased',
           amount: 0, // Unlimited
           change: 0,
           balanceAfter: 999999, // Symbolic for unlimited
           description: 'Unlimited membership activated',
           stripeSessionId: session.id,
           paymentAmount: session.amount_total / 100
         });
         
         console.log(`Subscription activated for user ${userId}`);
       } else {
         // Handle one-time purchase
         const { userId, packageId, seeds } = session.metadata;
         const seedCount = parseInt(seeds);
         
         const user = await User.findByIdAndUpdate(
           userId,
           { $inc: { 'seeds.available': seedCount } },
           { new: true }
         );
         
         if (!user) {
           console.error('User not found for seed purchase:', userId);
           return res.status(404).json({ error: 'User not found' });
         }
         
         await SeedTransaction.create({
           userId: userId,
           type: 'purchased',
           amount: seedCount,
           change: seedCount,
           balanceAfter: user.seeds.available,
           description: `Purchased ${seedCount} seeds - ${packageId} pack`,
           stripeSessionId: session.id,
           paymentAmount: session.amount_total / 100
         });
         
         console.log(`Successfully added ${seedCount} seeds to user ${userId}`);
       }
     } catch (error) {
       console.error('Error processing successful payment:', error);
       return res.status(500).json({ error: 'Failed to process payment' });
     }
     break;
     
   case 'customer.subscription.updated':
     const subscription = event.data.object;
     
     try {
       await User.findOneAndUpdate(
         { stripeCustomerId: subscription.customer },
         {
           'subscription.status': subscription.status,
           'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
           'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end
         }
       );
       
       console.log(`Subscription updated for customer ${subscription.customer}`);
     } catch (error) {
       console.error('Error updating subscription:', error);
     }
     break;
     
   case 'customer.subscription.deleted':
     const deletedSubscription = event.data.object;
     
     try {
       await User.findOneAndUpdate(
         { stripeCustomerId: deletedSubscription.customer },
         {
           'subscription.status': 'cancelled',
           'subscription.cancelledAt': new Date()
         }
       );
       
       console.log(`Subscription cancelled for customer ${deletedSubscription.customer}`);
     } catch (error) {
       console.error('Error handling subscription deletion:', error);
     }
     break;
     
   case 'checkout.session.expired':
     console.log('Checkout session expired:', event.data.object.id);
     break;
     
   default:
     console.log(`Unhandled event type ${event.type}`);
 }
 
 // Return a 200 response to acknowledge receipt of the event
 res.status(200).json({ received: true });
};

// Add bonus seeds (admin function)
exports.addBonusSeeds = [verifyToken, async (req, res) => {
 try {
   const { userId, amount, reason } = req.body;
   
   // TODO: Add admin role check here
   // if (!req.user.isAdmin) {
   //   return res.status(403).json({ success: false, message: 'Admin access required' });
   // }
   
   if (!userId || !amount || amount <= 0) {
     return res.status(400).json({ 
       success: false, 
       message: 'Invalid user ID or amount' 
     });
   }
   
   // Update user's seed balance
   const user = await User.findByIdAndUpdate(
     userId,
     { $inc: { 'seeds.available': amount } },
     { new: true }
   );
   
   if (!user) {
     return res.status(404).json({ 
       success: false, 
       message: 'User not found' 
     });
   }
   
   // Create transaction record
   await SeedTransaction.create({
     userId: userId,
     type: 'bonus',
     amount: amount,
     change: amount,
     balanceAfter: user.seeds.available,
     description: reason || `Bonus seeds added`,
     addedBy: req.userId
   });
   
   res.json({
     success: true,
     message: `Successfully added ${amount} bonus seeds`,
     newBalance: user.seeds.available
   });
 } catch (error) {
   console.error('Add bonus seeds error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to add bonus seeds' 
   });
 }
}];

// Refund seeds (admin function)
exports.refundSeeds = [verifyToken, async (req, res) => {
 try {
   const { userId, amount, reason } = req.body;
   
   // TODO: Add admin role check here
   // if (!req.user.isAdmin) {
   //   return res.status(403).json({ success: false, message: 'Admin access required' });
   // }
   
   if (!userId || !amount || amount <= 0) {
     return res.status(400).json({ 
       success: false, 
       message: 'Invalid user ID or amount' 
     });
   }
   
   // Update user's seed balance
   const user = await User.findByIdAndUpdate(
     userId,
     { $inc: { 'seeds.available': amount } },
     { new: true }
   );
   
   if (!user) {
     return res.status(404).json({ 
       success: false, 
       message: 'User not found' 
     });
   }
   
   // Create transaction record
   await SeedTransaction.create({
     userId: userId,
     type: 'refund',
     amount: amount,
     change: amount,
     balanceAfter: user.seeds.available,
     description: reason || `Refund processed`,
     addedBy: req.userId
   });
   
   res.json({
     success: true,
     message: `Successfully refunded ${amount} seeds`,
     newBalance: user.seeds.available
   });
 } catch (error) {
   console.error('Refund seeds error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Failed to process refund' 
   });
 }
}];