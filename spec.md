# Specification

## Summary
**Goal:** OLX-style home screen cleanup for Animal Pashu Bazar — remove the invite banner from the home page, replace the Account tab with a Share tab in the bottom navigation, and update the displayed version to Version 49.

**Planned changes:**
- Remove the "Invite a friend and help grow our community!" banner (including its Share/Invite button and container) from `HomePage.tsx`
- In `BottomNav.tsx`, replace the "Account" tab with a "Share" tab that triggers the Web Share API (with clipboard fallback) using the existing `useWebShare` hook; final tab order: Home, Chats, Sell, My Ads, Share
- Update the visible version label to "Version 49" wherever it appears in the UI (footer, header, or layout components)

**User-visible outcome:** The home page no longer shows the invite banner between sections, the bottom navigation bar now has a Share tab instead of Account, and the app displays Version 49.
