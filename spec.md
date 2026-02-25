# Specification

## Summary
**Goal:** Add a dark semi-transparent overlay to the header background image in Layout.tsx so that the "Pashu Mandi" brand text and navigation links are clearly readable.

**Planned changes:**
- Apply a dark semi-transparent overlay (e.g. `bg-black/50` or `bg-black/60`) over the header background image in `frontend/src/components/Layout.tsx`
- Ensure the overlay does not block interactive elements (links and buttons remain clickable)
- Keep all header structure, layout, height, logo, and navigation links unchanged

**User-visible outcome:** The header text "Pashu Mandi" and all navigation links are clearly legible with high contrast against the header background image.
