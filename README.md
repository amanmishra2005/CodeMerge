<div align="center">

# 🧬 CodeMerge

### Unify your coding-platform stats into one animated, AI-powered dashboard

**LeetCode · Codeforces · GeeksforGeeks · HackerRank — merged into a single profile**

![Node](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

---

## ✨ What is CodeMerge?

CodeMerge pulls your solved-problem stats from **four major competitive programming platforms** and merges them into one clean, animated dashboard — so you never have to open four different tabs to see how you're doing.

On top of that, it uses **Google's Gemini API** to analyze your merged profile and generate personalized, AI-powered feedback: your strengths, weak spots, and what to grind next.

| 🎯 Feature | Description |
|---|---|
| 🖇️ **Multi-platform linking** | Connect your LeetCode, Codeforces, GeeksforGeeks & HackerRank usernames |
| 📊 **Aggregated dashboard** | Total solved + Easy/Medium/Hard breakdown, per-platform cards, animated charts |
| 🤖 **AI feedback** | Gemini-powered analysis of your merged coding profile |
| 🔐 **Secure auth** | JWT authentication with bcrypt password hashing |
| 🎬 **Animated UI** | Framer Motion transitions across landing, auth, and dashboard pages |
| 📬 **Contact form** | Messages stored directly in MongoDB |

---

## 🖼️ Pages & Experience

- **Landing page** — animated hero with a live "merge graph" visualization, features section, how-it-works walkthrough, and contact form
- **Register / Login** — smooth animated transitions, form validation
- **Dashboard** — merged stats, per-platform breakdown cards, Recharts visualizations, and the Gemini-powered AI feedback tab

---

## 🗂️ Project Structure

```
codemerge/
├── backend/     # Node.js + Express + MongoDB API
└── frontend/    # React + Vite + Tailwind + Framer Motion
```

---

## ⚙️ Getting Started

### 1️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # already provided — just fill in real values
```

Edit `backend/.env`:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string ([Atlas free tier](https://www.mongodb.com/atlas) or local instance) |
| `JWT_SECRET` | Any long, random string |
| `GEMINI_API_KEY` | Free key from [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `CLIENT_ORIGIN` | Your frontend's URL (e.g. `http://localhost:5173`) |

Run it:

```bash
npm run dev      # nodemon, auto-restarts
# or
npm start
```

> API runs on `http://localhost:5000/api` by default. Health check: `GET /api/health`

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env    # already provided — just confirm the value
```

Edit `frontend/.env`:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Your backend's API base URL (e.g. `http://localhost:5000/api`) |

Run it:

```bash
npm run dev
```

Visit **`http://localhost:5173`** 🎉

---

## 🔌 Platform Data Sources

<details>
<summary><b>LeetCode</b> — no key needed</summary>
<br>
Uses LeetCode's own public GraphQL endpoint directly.
</details>

<details>
<summary><b>Codeforces</b> — official REST API</summary>
<br>
Codeforces has no built-in Easy/Medium/Hard labels, so solved problems are bucketed by problem rating:

- `≤ 1200` → Easy
- `1201 – 1900` → Medium
- `> 1900` → Hard
</details>

<details>
<summary><b>GeeksforGeeks</b> — best-effort community endpoint</summary>
<br>
GfG has no official public API. If the community endpoint is ever down, the dashboard gracefully shows a friendly "unavailable" message for that platform instead of breaking the page.
</details>

<details>
<summary><b>HackerRank</b> — reference link only</summary>
<br>
HackerRank exposes no public API for solved-problem counts. It's linked for reference only, and its card explains this clearly instead of showing fake numbers.
</details>

---

## 🚀 Deployment

| Layer | Where | Notes |
|---|---|---|
| **Backend** | Render, Railway, Fly.io, or any Node host | Set the same env vars as `.env`; point `CLIENT_ORIGIN` to your deployed frontend |
| **Frontend** | Vercel, Netlify, or any static host | `npm run build` → `dist/`; set `VITE_API_URL` to your backend's `/api` URL |
| **Database** | MongoDB Atlas (M0 free tier) | Whitelist your backend's IP (or `0.0.0.0/0`); paste connection string into `MONGO_URI` |

---

## 🛠️ Tech Stack

**Frontend**
`React 18` · `Vite` · `Tailwind CSS` · `Framer Motion` · `Recharts` · `React Router` · `Axios` · `lucide-react`

**Backend**
`Node.js` · `Express` · `MongoDB + Mongoose` · `JWT` · `bcryptjs` · `Google Gemini API`

---

<div align="center">

Built with ⚡ and a lot of merged commits.

</div>
