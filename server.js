const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Wallflower API is running' });
});

// Add auth routes
app.use('/api/auth', require('./src/backend/routes/authRoutes'));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build
  // Based on your file structure, it looks like the build output is in 'dist' at the root
  app.use(express.static(path.join(__dirname, 'dist')));

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string starts with:', mongoUri.substring(0, 30) + '...');
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    console.log('MongoDB connected successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    
    // More specific error messages
    if (err.message.includes('ENOTFOUND')) {
      console.error('Error: Cannot resolve MongoDB cluster address. Check your connection string.');
    } else if (err.message.includes('authentication failed')) {
      console.error('Error: Authentication failed. Check your username and password.');
    } else if (err.message.includes('whitelist')) {
      console.error('Error: IP whitelist issue. Ensure 0.0.0.0/0 is in your Atlas Network Access.');
    }
    
    // Don't exit in production, let the app run without DB
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

connectDB();

// Socket.io
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});