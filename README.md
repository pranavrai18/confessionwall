# Anonymous Confession Wall

A MERN stack project with Google OAuth 2.0, anonymous confessions, reactions, and secret-code protected edits.

## Setup

1. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
2. Start the server:
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:4000`.

## Notes

- Confessions are anonymous. Secret codes are required for edits/deletes and are never returned by the API.
- Reactions are public and do not require authentication.

