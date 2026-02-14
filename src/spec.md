# Specification

## Summary
**Goal:** Refresh the app into a mobile-first “Everything Tracker” with clearer security visibility, guided examples in each section, a new Crypto tracker section, and restore reliable loading/navigation.

**Planned changes:**
- Fix the regression preventing the app from loading so the initial route renders and navigation to Dashboard, Tasks, Goals, Calendar, and Budget works without blank screens, crashes, or infinite loading during authentication/profile init.
- Add a persistent, video game–themed “privacy confirmed” live status bar across all routes that is purple when securely authenticated and flashing/pulsing red when not authenticated.
- Redesign the global UI theme for a fun, helpful mobile-first tracker feel, incorporating Apple Settings–style grouped panels and toggle-style controls where applicable.
- Add clear, friendly security/encryption visibility copy near primary data entry areas in Tasks, Goals, Calendar, Budget, and Crypto (without unverifiable third-party security claims).
- Add 2–3 labeled example entries/templates per section (Tasks, Goals, Calendar, Budget, Crypto) shown in empty states and/or as quick-add suggestions.
- Add a new Crypto section with nav + route and per-user CRUD for crypto entries, including a simple client-side summary area, with a Coinbase-like visual style (no external APIs).
- Apply per-section theming so the Tasks section has a distinct sports-related / paper scroll / private feel while remaining accessible and consistent with the overall design.

**User-visible outcome:** The app loads reliably, shows a clear secure/not-secure status on every screen, has a refreshed mobile-first settings-like UI, provides helpful example templates and security notes in each section, includes a new Crypto tracker page with CRUD and a simple summary, and gives Tasks a distinct sports/paper-scroll themed look.
