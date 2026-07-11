# CodeMerge

**CodeMerge** unifies your coding-platform stats — LeetCode, Codeforces, GeeksforGeeks and
HackerRank — into a single animated dashboard, with AI-powered (Gemini) feedback on your
overall profile.

> Suggested project name: **CodeMerge** — it plays on `git merge` (developer-native vocabulary)
> and literally describes the product: merging every coding platform's stats into one place.
> Alternatives if you want options: **UniCode Stats**, **DevTally**, **StackSolved**, **CodeConflux**.

## Project structure

```
codemerge/
├── backend/     # Node.js + Express + MongoDB API
└── frontend/    # React + Vite + Tailwind + Framer Motion
```

## Features

- Animated landing page (hero with a "merge graph" visualization, features, how-it-works, contact)
- Animated register/login pages
- Link LeetCode, Codeforces, GeeksforGeeks and HackerRank usernames
- Aggregated dashboard: total solved + Easy/Medium/Hard breakdown, per-platform cards, charts
- AI feedback tab powered by Google's Gemini API, analyzing your merged profile
- Contact form (stores messages in MongoDB)
- JWT authentication, password hashing with bcrypt

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # already provided as .env — just fill in real values
```

Edit `backend/.env`:

- `MONGO_URI` — a MongoDB connection string (use [MongoDB Atlas](https://www.mongodb.com/atlas) free tier, or a local MongoDB instance)
- `JWT_SECRET` — any long random string
- `GEMINI_API_KEY` — get one free at https://aistudio.google.com/app/apikey
- `CLIENT_ORIGIN` — the URL your frontend runs on (e.g. `http://localhost:5173` locally, or your deployed frontend URL)

Run it:

```bash
npm run dev      # nodemon, auto-restarts
# or
npm start
```

The API runs on `http://localhost:5000/api` by default. Check `GET /api/health`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env    # already provided as .env — just confirm the value
```

Edit `frontend/.env`:

- `VITE_API_URL` — your backend's API base URL (e.g. `http://localhost:5000/api` locally, or your deployed backend URL + `/api`)

Run it:

```bash
npm run dev
```

Visit `http://localhost:5173`.

## 3. Notes on platform data sources

- **LeetCode** — uses LeetCode's own public GraphQL endpoint. No key needed.
- **Codeforces** — uses the official Codeforces REST API. Codeforces has no built-in
  easy/medium/hard labels, so solved problems are bucketed by rating
  (`≤1200` easy, `1201–1900` medium, `>1900` hard).
- **GeeksforGeeks** — GfG has no official public API, so this uses a best-effort
  community endpoint. If it's ever down, the dashboard will show a friendly "unavailable" message
  for that platform instead of breaking the whole page.
- **HackerRank** — HackerRank does not expose any public API for solved-problem counts, so it's
  linked for reference only; its card will explain this rather than show fake numbers.

## 4. Deploying

**Backend** — deploy to any Node host (Render, Railway, Fly.io, an EC2/VPS, etc.). Set the same
environment variables from `.env` in your host's dashboard, then set `CLIENT_ORIGIN` to your
deployed frontend's URL.

**Frontend** — deploy to Vercel, Netlify, or any static host that supports a Vite build
(`npm run build` produces a `dist/` folder). Set `VITE_API_URL` to your deployed backend's
`/api` URL as an environment variable in your host's dashboard before building.

**MongoDB** — use MongoDB Atlas's free M0 cluster for a zero-cost hosted database; just
whitelist your backend host's IP (or `0.0.0.0/0` for simplicity) and paste the connection
string into `MONGO_URI`.

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Recharts, React Router, Axios, lucide-react
- **Backend:** Node.js, Express, MongoDB + Mongoose, JWT, bcryptjs, Google Gemini API
