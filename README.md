# Dopamine Binder App

A full-stack web app for collectors to track meaningful items, organize them with categories/tags, and save personal notes that preserve the story behind each piece.

## Overview

Dopamine Binder App helps users build a personal “binder” of collectibles by combining structured organization with personal context.

- **Frontend:** React + Vite single-page app
- **Backend:** Node.js + Express API
- **Database:** MongoDB via Mongoose
- **Auth:** Passport Google OAuth 2.0 + Express sessions

---

## Tech Stack

### Client (Frontend)

- React 19
- React Router 7
- Vite 8
- CSS (custom styling)

### Server (Backend)

- Node.js
- Express 5
- Mongoose
- Passport + `passport-google-oauth20`
- `express-session`
- `cors`
- `dotenv`

---

## Project Structure

```text
dopamine-binder-app/
├── client/                    # React frontend
│   ├── public/                # static public assets (favicon, icons sprite)
│   ├── src/
│   │   ├── assets/            # app images + design assets
│   │   ├── components/        # reusable UI components
│   │   ├── context/           # React context/providers
│   │   ├── pages/             # routed page-level views
│   │   ├── services/          # API utilities for backend calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/            # DB/auth/environment configuration
│   │   ├── controllers/       # request handlers
│   │   ├── middleware/        # custom middleware
│   │   ├── models/            # Mongoose models/schemas
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # backend business logic/services
│   │   └── app.js             # Express app setup
│   ├── server.js              # backend entrypoint
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB connection URI
- Google OAuth credentials (for sign-in)

### 1) Clone

```bash
git clone https://github.com/NicaelaS/dopamine-binder-app.git
cd dopamine-binder-app
```

### 2) Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 3) Configure environment variables (server)

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_google_callback_url
CLIENT_URL=http://localhost:5173
```

> Adjust values to match your local/dev setup.

### 4) Run the app

In one terminal (backend):

```bash
cd server
npm run dev
```

In a second terminal (frontend):

```bash
cd client
npm run dev
```

---

## Available Scripts

### Client

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — run Oxlint

### Server

- `npm run dev` — run server with watch mode
- `npm start` — run server normally

---

## API & App Architecture (High-Level)

- Frontend routes and page views live in `client/src/pages`.
- Reusable UI is in `client/src/components`.
- Frontend service layer in `client/src/services` calls backend endpoints.
- Backend routes (`server/src/routes`) map to controller logic (`server/src/controllers`).
- Business logic can be separated in `server/src/services`.
- Data persistence is handled through Mongoose models in `server/src/models`.
- Authentication/session handling is configured in backend app setup.

---

## Design & Visual Assets

Yes — these are worth documenting because they are part of the product experience and branding.

Custom assets include:

- `background.svg` (custom background artwork)
- Custom binder-themed images/illustrations in `client/src/assets`
- `client/public/icons.svg` icon sprite
- `client/public/favicon.svg`

These assets are authored/curated for this app’s look-and-feel and support the “digital binder” visual identity.

---

## Current Status

This repository is now a **full-stack collector app** (not just a Vite template), with:

- working React frontend
- Express/Mongo backend
- session-based auth flow with Google OAuth
- custom visual assets and styling

---

## License

No license file is currently defined in this repository.  
If you want, add a `LICENSE` file (e.g., MIT) and update this section.