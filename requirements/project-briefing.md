# STOCKQUEST - Project Briefing

## READ THIS FIRST

This document contains critical information everyone must understand before starting work on StockQuest. Read it completely before touching any code.

---

## Project Overview

**What We're Building:**
A competitive stock trading simulation platform where users create/join leagues, manage virtual portfolios, execute trades, and compete against others using real market data.

**Assignment Context:**
This is a university project demonstrating full-stack development with microservices architecture. The system must showcase proper separation of concerns, database design, API development, and modern frontend practices.

**Deadline:**
Software Tech Assigment 1 on 22 Feb 2026

---

## Technical Architecture

### System Components

**Frontend (React + TypeScript)**

- User interface and experience
- Communicates with both backend services
- Handles routing, state management, data visualization
- Runs on: `localhost:5173`

**Backend A (NestJS + TypeORM)**

- Primary API for user data, leagues, portfolios, orders
- PostgreSQL integration via TypeORM
- Handles authentication and authorization
- Runs on: `localhost:3000`

**Backend B (FastAPI + Python)**

- Market data service
- External API integration (stock prices, company data)
- Data caching and aggregation
- Runs on: `localhost:8000`

**Database (Supabase PostgreSQL)**

- Hosted PostgreSQL database
- Stores: users, leagues, portfolios, holdings, orders, transactions
- Managed through Supabase dashboard and SQL migrations

**Cache Layer (Redis)**

- Temporary data storage for market prices
- Session management
- Rate limiting and performance optimization

### Data Flow

1. User interacts with React frontend
2. Frontend calls NestJS API for user/league/portfolio operations
3. Frontend calls FastAPI for market data and stock information
4. NestJS reads/writes to PostgreSQL database
5. FastAPI fetches external data, caches in Redis, returns to frontend
6. Both backends communicate with database and cache as needed

---

## Technology Stack - What You Need Installed

### Required Software

**Node.js & npm**

- Version: 18.x or higher
- Used for: Frontend and NestJS backend
- Install from: nodejs.org

**Python**

- Version: 3.11 or higher
- Used for: FastAPI backend
- Install from: python.org

**Git**

- Version control system
- Required for repository management
- Install from: git-scm.com

**Code Editor**

- Recommended: VS Code with extensions:
  - ESLint
  - Prettier
  - TypeScript
  - Python
  - Tailwind CSS IntelliSense

### Cloud Accounts Required

**GitHub**

- Repository hosting
- Team collaboration
- Version control

**Supabase**

- PostgreSQL database hosting
- Free tier sufficient for this project
- Sign up at: supabase.com

**Redis Cloud**

- Upstash.com or Redis Cloud
- Alternative: Run Redis locally

---

## Critical Rules and Standards

### Version Control Rules

**NEVER commit:**

- `.env` files containing real credentials
- `node_modules/` directories
- `__pycache__/` or `.pyc` files
- Database dumps with sensitive data
- API keys or passwords in any form

**ALWAYS:**

- Commit `.env.example` templates (with placeholder values)
- Write meaningful commit messages
- Pull before starting work each day
- Push completed work at end of day
- Create feature branches for major changes

### Code Standards

**Naming Conventions:**

- Files: kebab-case (`user-service.ts`, `portfolio-controller.py`)
- Components: PascalCase (`UserDashboard.tsx`, `LeagueCard.tsx`)
- Functions/variables: camelCase (`getUserData`, `portfolioValue`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)

**Code Organization:**

- One component per file
- Group related functionality in modules
- Keep functions small and focused
- Document complex logic with comments

**Error Handling:**

- Never expose sensitive errors to frontend
- Log errors with context
- Return user-friendly error messages
- Handle edge cases explicitly

### Environment Variables

**Structure:**
Each service maintains its own `.env` file with:

- Database connection strings
- API keys for external services
- Redis connection details
- Service-specific configuration

**Security:**

- Generate strong, unique passwords
- Use different credentials for development vs production
- Never share credentials via chat/email (use secure methods)
- Rotate credentials if accidentally exposed

---

### Testing Before Commit

**Frontend:**

- App builds without errors: `npm run build`
- No console errors in browser
- UI renders correctly at different screen sizes
- Links and navigation work

**Backend:**

- Service starts without errors
- API endpoints return expected responses
- Database queries execute successfully
- No TypeScript/linting errors

---
