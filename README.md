# StockQuest

StockQuest is a full-stack **stock trading simulation** platform. Users sign up, complete onboarding, join **leagues**, manage **virtual portfolios**, place **buy/sell orders** against live-style quotes, and compete on **leaderboards**—with **gamification** (quests, XP, badges, notifications) and a **Learn** hub (articles, courses, quizzes).

This repository is structured as a **monorepo** with a React SPA, a NestJS API backed by **PostgreSQL** (via **Prisma**), and an optional **FastAPI** service scaffold for AI-related endpoints.

---

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Scripts](#scripts)
- [Project layout](#project-layout)
- [Requirements & documentation](#requirements--documentation)
- [CI](#ci)
- [Contributing](#contributing)

---

## Features

- **Authentication** — Sign-up, sign-in, JWT-based access to protected routes  
- **Onboarding & risk profile** — User profile and risk tolerance capture  
- **Leagues** — Create and join competitive trading leagues with schedules and caps  
- **Portfolios & orders** — Virtual cash, holdings, and market orders (buy/sell)  
- **Market data** — Quotes and history via integrated market data service (Yahoo Finance–backed in Nest)  
- **Gamification** — Quests, progression, badges, and in-app notifications  
- **Learn** — Articles, courses, quizzes, and streaks  
- **Admin** — Administrative dashboard surface (role-gated)  
- **Stock detail** — Per-symbol views for research and trading context  

---

## Architecture

```text
┌─────────────────┐     HTTPS/REST      ┌──────────────────┐
│  React (Vite)   │ ──────────────────► │  NestJS API      │
│  frontend/      │   (optional WS)    │  backend-nestjs/ │
└────────┬────────┘                     └────────┬─────────┘
         │                                       │
         │  Optional AI HTTP                     │  Prisma ORM
         ▼                                       ▼
┌─────────────────┐                     ┌──────────────────┐
│  FastAPI        │                     │  PostgreSQL      │
│  backend-fastapi│                     │  (Docker / host) │
└─────────────────┘                     └──────────────────┘
```

In **local development**, the Vite dev server can **proxy** `/api` to the Nest app on port `3000`, so the browser talks to a single origin and avoids common CORS issues.

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, TanStack Query, React Router, Zustand |
| API | NestJS 11, class-validator, Passport JWT |
| Data | Prisma 5, PostgreSQL |
| Market quotes | `yahoo-finance2` (server-side) |
| Optional AI API | Python 3, FastAPI (health scaffold) |
| Containers | Docker Compose (PostgreSQL; Redis service included for local infra) |

---

## Prerequisites

- **Node.js** 20.x (recommended; aligns with CI) and npm  
- **Docker Desktop** (or compatible engine) for Compose-based PostgreSQL  
- **Python 3.10+** (only if you run the FastAPI service)  

---

## Getting started

### 1. Clone and install

```bash
git clone <your-fork-or-remote-url>
cd stockquest
```

Install **frontend** and **backend** dependencies:

```bash
cd frontend && npm ci && cd ..
cd backend-nestjs && npm ci && cd ..
```

### 2. Start PostgreSQL

From the repository root, create a `.env` file for Docker Compose (example values):

```env
DB_USERNAME=stockquest
DB_PASSWORD=stockquest
DB_NAME=stockquest
```

Start the database:

```bash
docker compose up -d postgres
```

### 3. Configure the Nest API

```bash
cd backend-nestjs
cp .env.example .env
```

Edit `.env`: set `DATABASE_URL` to match your Postgres instance (see [Environment variables](#environment-variables)). Apply migrations and (optionally) seed:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Start the API:

```bash
npm run start:dev
```

The API listens on **http://localhost:3000** by default.

### 4. Configure and run the frontend

```bash
cd ../frontend
cp .env.example .env
```

For local dev, you can leave `VITE_API_URL` unset so requests use the Vite **`/api` proxy** to Nest (see `vite.config.ts`). Start the UI:

```bash
npm run dev
```

Open **http://localhost:5173** in the browser.

### 5. (Optional) FastAPI service

```bash
cd ../backend-fastapi
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Point the frontend at this service with `VITE_AI_API_URL` if you extend the AI routes beyond the health check.

---

## Environment variables

### `backend-nestjs/.env`

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `DIRECT_URL` | Direct DB URL for migrations (often same as `DATABASE_URL` for local non-pooled Postgres; required by `schema.prisma`) |
| `JWT_SECRET` | Secret for signing JWTs (use a strong value in production) |
| `NODE_ENV` | `development` / `production` |

### `frontend/.env`

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Optional. Full base URL of the Nest API. If unset in dev, the app uses defaults / proxy behavior (see `src/config/api.ts`). |
| `VITE_WS_URL` | WebSocket base URL when real-time features are enabled against the API host |
| `VITE_AI_API_URL` | Base URL for the FastAPI AI service (default local: `http://localhost:8000`) |

### Docker Compose (repo root)

| Variable | Purpose |
|----------|---------|
| `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Postgres superuser credentials and database name for the `postgres` service |

---

## Database

- Schema and migrations live in **`backend-nestjs/prisma/`**.  
- After changing the schema, create migrations from `backend-nestjs`:

  ```bash
  npx prisma migrate dev --name <description>
  ```

- Seed script is configured in `backend-nestjs/package.json` under the `prisma.seed` key.

---

## Scripts

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

### Backend (`backend-nestjs/`)

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Nest watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled app |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Jest) |
| `npm run test:e2e` | E2E tests (Supertest) |

---

## Project layout

```text
stockquest/
├── frontend/              # React + Vite SPA
├── backend-nestjs/        # Primary REST API (NestJS + Prisma)
├── backend-fastapi/       # Optional Python FastAPI service
├── docker-compose.yml     # Local PostgreSQL (+ Redis service)
├── requirements/          # Course / assignment documentation
└── .github/workflows/     # CI workflows
```

---

## Requirements & documentation

Product and assignment context (user stories, milestones, functional notes) lives in **`requirements/`**. Consult those documents before large feature or schema changes so the implementation stays aligned with the brief.

---

## CI

GitHub Actions workflows under **`.github/workflows/`** run on pushes and pull requests to the default branches. They typically perform **install → lint → build** for the frontend and **install → lint → test** for the Nest backend. If workflow `working-directory` paths drift from the actual folders (`frontend/`, `backend-nestjs/`), update the YAML so CI matches this repository layout.

---

## Contributing

1. Create a branch from `main` (or the team’s default branch).  
2. Keep changes focused; match existing code style and patterns.  
3. Run **lint** and **build** for the frontend and **lint** / **tests** for the backend before opening a PR.  
4. Reference or update **`requirements/`** when behavior is contractually specified there.

---

## License

Backend and frontend packages are marked **private** in their respective `package.json` files. Add or adjust a root **LICENSE** file if you intend to open-source the project under explicit terms.
