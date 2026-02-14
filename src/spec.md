# Specification

## Summary
**Goal:** Add Tasks↔Calendar bi-directional sync for dated items, recurring calendar entries, a dashboard market summary, a modern hero-style header, and improved crypto profit/loss summaries.

**Planned changes:**
- Implement per-user bi-directional syncing between Tasks with due dates and Calendar items designated as Tasks, including consistent create/update/delete behavior across both.
- Update Calendar entry create/edit flow to let users choose entry type (Task vs Event), where Task entries sync into Tasks and Event entries remain calendar-only.
- Add recurring Calendar entries (None/Weekly/Monthly/Yearly) via a recurrence control in Calendar entry create/edit, and reflect recurrence in calendar views and list.
- Add a Dashboard “market summary” section showing top 10 Crypto, Stocks, and Commodities with current USD prices, including loading/error/fallback states per category.
- Modernize the global header to prominently display “The Everything Tracker” with a readable hero-style background image and responsive behavior.
- Enhance the Crypto page to show total portfolio profit/loss (USD) and replace “Unique Assets” with a per-asset profit/loss status listing using live prices when available.

**User-visible outcome:** Dated tasks and calendar tasks stay in sync across Tasks and Calendar, calendar entries can be set as events or tasks and can recur weekly/monthly/yearly, the dashboard shows a market summary for crypto/stocks/commodities, the app has a modern hero header, and the crypto page clearly shows total and per-asset profit/loss.
