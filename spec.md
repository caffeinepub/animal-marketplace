# Animal Pashu Bazar

## Current State
A full-featured animal marketplace app (OLX-style) with listing creation, chat, user profiles, payment flow, admin dashboard, and role-based routing. The Admin Dashboard at `/admin` was previously blocking or appearing transparent due to CSS layering and the `AdminRouteGuard` was waiting for a slow backend `isAdmin()` call before granting access.

## Requested Changes (Diff)

### Add
- Refresh button on Admin Dashboard to reload all data

### Modify
- **AdminRouteGuard**: Completely simplified — no backend `isAdmin()` call anymore. Checks principal ID directly and instantly. No loading spinner waiting for backend.
- **Admin button in Layout**: Changed from `navigate({ to: '/admin' })` to `window.location.href = '/admin'` for a hard page reload that bypasses any router state issues.
- **AdminDashboardPage**: Fully rewritten with all inline `!important`-equivalent styles (React inline styles). Solid white background, opacity:1, visibility:visible enforced at the top-level div. All buttons (APPROVE / REJECT / DELETE) use inline styles with explicit `pointerEvents: 'auto'` and `zIndex: 9999` — no CSS class dependencies.
- Default tab changed to "pending" so admin sees pending listings immediately on open.
- Version label updated to v57.

### Remove
- `useActor` and `useQuery` imports from App.tsx (no longer needed by AdminRouteGuard)

## Implementation Plan
1. Simplify AdminRouteGuard to principal-ID-only check (no backend call)
2. Update Admin button to use window.location.href
3. Rewrite AdminDashboardPage with full inline styles for all interactive elements
4. Add Refresh button to reload data
5. Update version labels to v57

## UX Notes
- Pending tab is shown by default so the admin sees actionable items first
- APPROVE/REJECT buttons are large, green/red, clearly labeled
- All content has solid white background with no transparency
- Stats, Users, and Activity tabs remain accessible via tab bar
