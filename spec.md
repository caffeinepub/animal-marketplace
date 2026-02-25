# Specification

## Summary
**Goal:** Fix the bottom navigation bar's z-index and pointer events so all tabs are reliably tappable, and update the app version label to "Version 55".

**Planned changes:**
- Set `z-[999]` on the bottom navigation bar's root container in `BottomNav.tsx`
- Apply `pointer-events: auto` and proper positioning to all five tab buttons (Home, Chats, Sell, My Ads, Account) in `BottomNav.tsx`
- Apply `z-[999]` and `isolation: isolate` to the floating "Sell" button in `BottomNav.tsx`
- Add `pointer-events: none` to all decorative/background layer elements in `Layout.tsx` and `HomePage.tsx`
- Audit all page components (HomePage, PostAdPage, ListingDetailPage, MessagesPage, ProfilePage, UserDashboardPage, SignUpPage, etc.) for full-width/full-height containers that may block the bottom nav, and apply `pointer-events: none` where needed
- Verify the "Actor not available" fix is intact in `useActor.ts`, `useQueries.ts`, `SignUpPage.tsx`, and `App.tsx`; re-apply if any regression is found
- Update the visible version label to "Version 55" throughout the UI

**User-visible outcome:** All five bottom navigation tabs respond correctly to taps/clicks on every page, the Sell button is always accessible, and the app displays "Version 55".
