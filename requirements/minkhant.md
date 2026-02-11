# StockQuest: API & Logic Implementation

**To:** Min Khant

**From:** Phanatcha

**Project:** StockQuest

You are responsible for the backend engineering of the **League & Portfolio Management** domain. Your goal is to build a robust, validated API that handles virtual trading competitions and portfolio tracking. Implementation must be clean and ready for Waranyanat to document and test.

### Step 1: Leagues Resource Implementation

- [ ] **CREATE**: Build `POST /leagues` for competition setup (name, start capital, end date).
- [ ] **READ**: Build `GET /leagues` with status and popularity filtering.
- [ ] **UPDATE**: Build `PATCH /leagues/:id` to allow admins to modify league rules or timelines.
- [ ] **DELETE**: Build `DELETE /leagues/:id` to handle league cancellations.

### Step 2: Portfolios Resource Implementation

- [ ] **CREATE**: Build `POST /leagues/:id/join` to initialize a user's portfolio in a specific league.
- [ ] **READ**: Build `GET /portfolios/:id` to return cash balance, holdings, and total value.
- [ ] **UPDATE**: Build `PATCH /portfolios/:id` to handle social visibility and theme settings.
- [ ] **DELETE**: Build `DELETE /portfolios/:id` to allow users to exit a league.

### Step 3: Orders Engine & Business Logic

- [ ] **Execution**: Build `POST /orders` for processing Buy/Sell transactions.
- [ ] **Validation Logic**: Implement checks for market status, virtual cash sufficiency, and league activity.
- [ ] **State Management**: Ensure every order correctly updates the portfolio's cash balance and holding quantity.

### Step 4: System Integrity & Validation

- [ ] **Data Sanitization**: Use DTOs to reject invalid inputs, such as negative stock quantities or expired league joins.
- [ ] **Error Handling**: Standardize HTTP responses (400 for bad data, 404 for missing resources).
- [ ] **Handover**: Ensure the API is fully functional and the repository is clean for Waranyanat to begin testing and report writing.

---
