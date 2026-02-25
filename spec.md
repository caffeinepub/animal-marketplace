# Specification

## Summary
**Goal:** Add VIP Ads support to Pashu Mandi, including a "Featured Animals" section on the home page, premium visual styling for VIP listings, and a VIP option in the Post Ad form with adjusted payment flow.

**Planned changes:**
- Add an `isVip` boolean field (default `false`) to the listing data model; update `createListing` to accept and store it; update `getListings` to return VIP listings first, then non-VIP sorted by timestamp descending.
- Add a "Make this a VIP Ad (₹500)" checkbox/toggle to the Post Ad form, updating form state and passing the flag to PaymentModal and the backend on submission.
- Update PaymentModal to show ₹500 fee and encode ₹500 in the UPI QR code when `isVip` is true; disable/hide promo code input for VIP ads with an explanatory note; keep existing ₹199 flow unchanged for non-VIP ads.
- Update ListingCard to show a gold border and a gold "Verified" badge overlay when `isVip` is true; non-VIP cards remain unchanged.
- Add a "Featured Animals" section at the top of the HomePage showing only VIP listings in a horizontally scrollable row or small grid, with a gold-accented heading; hide the section entirely when no VIP listings exist; the main listings grid below continues to show all listings (VIP first).

**User-visible outcome:** Sellers can opt into a VIP Ad (₹500) when posting; VIP listings appear with a gold border and "Verified" badge throughout the app, are highlighted in a dedicated "Featured Animals" section at the top of the home page, and are sorted to the top of the main listings grid.
