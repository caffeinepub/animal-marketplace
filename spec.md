# Specification

## Summary
**Goal:** Update the Helpline page contact details and footer call link with real phone numbers and email address.

**Planned changes:**
- In `HelplinePage.tsx`, replace the support email placeholder with `irfankhansingboard1998@gmail.com` (as a mailto link or styled text)
- In `HelplinePage.tsx`, replace the single helpline number with two numbers: `7829297025` and `8461207976`, keeping the "Available: 10 AM – 6 PM" note
- In the footer (`Layout.tsx`), update the "Call" link `href` to `tel:7829297025`
- In the footer, update any visible phone number label to show `7829297025 / 8461207976`

**User-visible outcome:** The Helpline page shows the real support email and both helpline numbers, and the footer's Call link dials the correct primary number.
