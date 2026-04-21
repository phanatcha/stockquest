# StockQuest Functional Requirements

## 🔐 FR3.1.1 — User Account Management
* **FR3.1.1.1**: User Registration (name, email, password)
* **FR3.1.1.2**: Secure Login + Two-Factor Authentication (2FA)
* **FR3.1.1.3**: Account Verification (before live trading access)
* **FR3.1.1.4**: Role Assignment (Learner / Trader / Administrator)
* **FR3.1.1.5**: Auto Logout after inactivity (live trading sessions)
* **FR3.1.1.6**: 2FA Enrollment & Recovery (TOTP / Email / SMS)
* **FR3.1.1.7**: Mandatory 2FA trigger for Trader & Admin sensitive actions

## 📈 FR3.1.2 — Trading & Portfolio Management
* **FR3.1.2.1**: Dual-Mode Toggle (Virtual ↔ Real portfolio)
* **FR3.1.2.2**: Buy / Sell market order execution (virtual & live)
* **FR3.1.2.3**: Real-time / near-real-time market data display
* **FR3.1.2.4**: Interactive portfolio charts & dashboard
* **FR3.1.2.5**: Stock search with filters/criteria
* **FR3.1.2.6**: Transaction history log for every order

## 🏆 FR3.1.3 — Gamification & League System
* **FR3.1.3.1**: Create / Join fantasy stock leagues (The Bullring)
* **FR3.1.3.2**: Real-time leaderboards for active leagues
* **FR3.1.3.3**: Award virtual points & achievement badges
* **FR3.1.3.4**: Gate advanced trading tiers behind prerequisite quizzes

## 🤖 FR3.1.4 — AI Sentiment Analysis
* **FR3.1.4.1**: Process market data through AI microservice (FastAPI) for sentiment scores
* **FR3.1.4.2**: Auto-monitor portfolios & generate high-risk concentration alerts
* **FR3.1.4.3**: AI-driven educational explanations alongside complex market events

## 📚 FR3.1.5 — Education & Mode Transition
* **FR3.1.5.1**: Toggle virtual portfolio to live trading (for experienced traders)
* **FR3.1.5.2**: Library of educational articles, courses, and quizzes

## 🛠️ FR3.1.6 — Admin Panel
* **FR3.1.6.1**: Admin dashboard to monitor gamification metrics & user activity
* **FR3.1.6.2**: Manual audit & adjustment of user records/transactions

## 🔔 FR3.1.7 — Notifications
* **FR3.1.7.1**: In-app & email notifications (portfolio alerts, badges, league events)
