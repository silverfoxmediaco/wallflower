# Wallflower

A dating app for introverts, built around a slow, deliberate "seed" mechanic instead of endless swiping.

**Live:** https://wallflower.me

## The problem

Mainstream dating apps reward volume: swipe fast, message everyone, and hope something sticks. That pace is exactly what puts a lot of introverts off. Wallflower makes interest scarce and intentional. Each member has a small balance of seeds, sending one is a deliberate signal, and conversation only opens once interest is mutual.

## What I built

I designed and built Wallflower solo, front to back: the React client, the Express API, the MongoDB data model, the Stripe payment flow, real-time messaging over Socket.IO, image handling through Cloudinary, and transactional email. The same Node process serves the API, the WebSocket server, and the built React app in production.

## Key features

- **Seed-based matching.** New accounts start with 5 seeds. Sending a seed to a profile spends one; when two people have sent each other seeds, the server detects the match on the second send and notifies both.
- The **Garden** view groups people into seeds received, seeds sent, and mutual matches.
- **Browse** returns profiles with a completed bio and interests, excluding anyone the member has already sent a seed to.
- **Messaging gated on mutual interest.** The API rejects any message between two users who have not both sent a seed. Text is free; sending an image costs 1 seed unless the member is subscribed.
- **Paid seeds and membership via Stripe Checkout.** Four one-time seed packs (5, 15, 30, 60 seeds) and a monthly "Unlimited Seeds" subscription. Subscribers send seeds and images without spending balance.
- **Profiles** with up to 6 photos, per-photo display mode (contain or cover), interests, personality type, and question/answer prompts, plus saved browse filters (age range, distance, interested in, has photo).
- **Email notifications** for seed received, new match, new message, and low seed balance, each controllable from a notification settings page.
- Password reset by emailed link, a contact form that emails support and sends the user a confirmation, and static pages for terms, privacy, community guidelines, safety tips, and help.

## Architecture

```
  React 18 SPA (Vite, React Router, React Bootstrap)
        |  REST /api/*  (JWT in Authorization header)
        |  Socket.IO    (per-user rooms)
        v
  Express 4 + Socket.IO  (single Node process, also serves /dist in production)
        |-------------> MongoDB (Mongoose): User, Message, SeedTransaction, Contact
        |-------------> Stripe: Checkout sessions, subscriptions, signed webhooks
        |-------------> Cloudinary: profile photos and message images
        '-------------> SMTP via Nodemailer: Gmail, SendGrid, Mailtrap, or generic SMTP
```

In development, Vite runs the client and proxies `/api` to the Express server on port 5000. In production, `npm run build` writes the client to `dist/` and Express serves it with an SPA catch-all after the API routes.

## Notable engineering

**Stripe webhook before the body parser.** `POST /api/seeds/webhook` is mounted with `express.raw()` ahead of `express.json()`, so the raw payload reaches `stripe.webhooks.constructEvent` and the signature can be verified. The handler covers `checkout.session.completed` (credits seeds for one-time packs or activates the subscription), `customer.subscription.updated`, `customer.subscription.deleted`, and `checkout.session.expired`.

**Server-side price checks.** The client sends a package id, seed count, and amount, but the server holds the package table and rejects any request where the seeds or price in cents do not match it before a Checkout session is created.

**Seed ledger.** Every purchase, spend, bonus, and refund writes a `SeedTransaction` row with the change and the resulting balance, indexed by user and date, so balance history is auditable separately from the counter on the user document. Seed balance changes on the user use atomic `$inc` updates.

**Real-time messaging.** Each client joins a Socket.IO room named after its user id. The REST handlers emit `new_message`, `messages_read`, and `message_deleted` into the recipient's room after the database write, and typing indicators are relayed socket to socket. Conversation ids are derived deterministically from the two participant ids.

**Image uploads with cleanup.** Message images go through Multer to Cloudinary (JPEG, PNG, or WebP, 5 MB limit). If the match check or seed check fails after the upload has already happened, the handler deletes the uploaded asset from Cloudinary so rejected sends do not leave orphaned files. Deleting a message also removes its image.

**Notification throttling.** Low balance emails fire when a non-subscriber drops below 5 seeds, at most once per 24 hours, tracked by a timestamp on the profile. Every notification checks the recipient's email preference first.

## Data and security handling

- JWT auth (`jsonwebtoken`), signed with `JWT_SECRET`, expiry from `JWT_EXPIRE` (default 7 days). Tokens are sent as a Bearer header.
- Passwords hashed with bcrypt in a Mongoose pre-save hook; the password field is excluded from queries by default.
- Registration is validated with `express-validator`: valid email, password of at least 8 characters with confirmation, and a date of birth that must make the user 18 or older.
- Password reset tokens are 32 random bytes; only a SHA-256 hash is stored, with a 1 hour expiry.
- Public endpoints (featured members, profile views) strip email, password, and seed data from the response.
- All secrets (MongoDB, JWT, Stripe, Cloudinary, email) are read from environment variables.

## Tech stack

React 18, Vite 5, React Router 6, React Bootstrap, Socket.IO client, Node.js, Express 4, Socket.IO, MongoDB with Mongoose 7, Stripe, Cloudinary with Multer, Nodemailer, express-validator, bcryptjs, jsonwebtoken.

## Status

`.env.example` lists `OPENAI_API_KEY` and `REDIS_URL`, but no code uses OpenAI or Redis yet. Admin endpoints for bonus seeds, refunds, and mock profile creation authenticate the caller but do not yet check an admin role. The "flowers in bloom" section of the Garden and the `/api/chat` routes are placeholders.

## Running locally

Requires Node 16 to 23 and a MongoDB instance.

```bash
npm install
cp .env.example .env   # then fill in your own values
npm run dev            # Express on :5000 (nodemon) + Vite dev server
```

Other scripts: `npm run build` (client to `dist/`), `npm start` (production server), `npm run preview`.

Environment variables read by the server:

- Server: `PORT`, `NODE_ENV`, `MONGODB_URI`, `CLIENT_URL`
- Auth: `JWT_SECRET`, `JWT_EXPIRE`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Email: `EMAIL_SERVICE`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `SUPPORT_EMAIL`, `SENDGRID_API_KEY`, `MAILTRAP_USER`, `MAILTRAP_PASS`

The client calls the API with relative `/api` paths (proxied by Vite in development) and picks the Socket.IO host from `window.location`, so it needs no build-time variables. To test payments locally, forward Stripe events to `/api/seeds/webhook` with the Stripe CLI and use the signing secret it prints as `STRIPE_WEBHOOK_SECRET`.

## Screenshots

<!-- screenshots: add docs/screenshot-*.png -->
