# The Bullring: Fantasy League System

## League Lifecycle
1. Users can create a league by setting a name, start/end date, and maximum number of participants.
2. Users can browse and join open leagues before they start.
3. A league transitions through states: `LOBBY` → `ACTIVE` → `COMPLETED`.

## During an Active League
* Each participant starts with the same amount of virtual currency.
* Participants can buy and sell stocks using real market prices.
* Track each participant's portfolio value in real time (holdings + remaining cash).
* Calculate and rank participants by total portfolio value.

## Leaderboard
* Display a live-ranked leaderboard showing each participant's rank, username, portfolio value, and percentage gain/loss from starting capital.
* Update rankings whenever a trade is executed or prices change.

## League Completion
* When the end date is reached, freeze all trading for that league.
* Calculate final rankings.
* Award XP and virtual points to participants based on finishing position (1st gets the most, descending from there).
* Unlock achievement badges for top finishers (e.g. "Top 3 Finisher", "First Place").

## Rules & Constraints
* A user can participate in multiple leagues simultaneously.
* No shorting — users can only buy stocks they can afford and sell stocks they own.
* A league requires a minimum of 2 participants to move from `LOBBY` to `ACTIVE`.

## Data to track per participant per league (Portfolio):
* Starting cash, remaining cash
* Current holdings (stock symbol, quantity, average buy price)
* Total portfolio value (cash + market value of holdings)
* XP and points earned from the league
