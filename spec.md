# Specification

## Summary
**Goal:** Fix the `/tracker` route guard so the owner principal can access it without being redirected, and add an "ADMIN PANEL" button at the top of the side menu visible only to the owner principal.

**Planned changes:**
- Fix `CattleTrackerRouteGuard` in `App.tsx` to show a loading spinner while auth is loading, grant access when the authenticated principal matches `rhoqt-xhqg1-66ofc-khas4-fm4w6-73h56-vt55b-5bfnp-adgps-qxwoy-iqe`, and redirect all others to `/`
- Fix `useIsCattleTrackerUser()` hook to synchronously derive the owner check directly from the identity context principal string instead of an async backend query
- Add an "ADMIN PANEL" button at the very top of the side/mobile menu in `Layout.tsx`, styled with a Professional Blue background and white bold text, routing to `/tracker`, visible only when the authenticated principal matches the owner principal and completely absent from the DOM for all other users

**User-visible outcome:** The owner principal can navigate to `/tracker` without being redirected, and sees a prominent "ADMIN PANEL" button at the top of the side menu. All other users see no change.
