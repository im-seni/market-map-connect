## Build the 10-Stamp Rewards System

### How it works (recap)
- 1 stamp per vendor visit (same vendor max once per day)
- Fill 10/10 → user picks 1 of 3 reward coupons → coupon lands in `/coupons` → stamps reset to 0/10

### New files

**`src/data/rewards.ts`**
- `STAMPS_PER_CARD = 10`
- `RewardOption` type + `REWARD_OPTIONS` (3 options: ₩3,000 off, free drink, free side; all `validDays: 30`)
- `Stamp` type (`vendorId`, `collectedOn` ISO date, `collectedAt` ms)
- Helpers: `rewardOptionById`, `toLocalIsoDate`, `expiryFromNow(days)`

**`src/contexts/CouponsContext.tsx`** (`localStorage`-backed, seeded with the 4 existing coupons on first load)
- State: `coupons: Coupon[]`
- `addCoupon(coupon)` — appends, persists
- `couponById(id)` — replaces the static export
- Provider + `useCoupons()` hook

**`src/contexts/RewardsContext.tsx`** (`localStorage`-backed)
- State: `stamps: Stamp[]`, `claimedCount: number`
- `addStamp(vendorId)` — no-op if same vendor already stamped today; toast on success / on already-stamped
- Derived: `count = stamps.length`, `canClaim = count >= 10`
- `claim(rewardOptionId)` — calls `addCoupon()` with a generated `Coupon` (titleKo/En from reward, `expiresAt = expiryFromNow(validDays)`, state `active`, `vendorId: ""` since reward isn't vendor-bound), resets stamps to `[]`, increments `claimedCount`, toast

### File updates

**`src/App.tsx`** — wrap routes with `<CouponsProvider>` then `<RewardsProvider>` (Rewards depends on Coupons). Place inside the existing `<QueueProvider>` tree.

**`src/data/coupons.ts`** — keep types and seed `coupons` array, but the array becomes the seed for `CouponsContext`. Static `couponById` becomes a fallback for code that doesn't have context access (`HomeScreen` featured coupon). Actually — to keep it simple, leave the seed array exported for context bootstrap, and re-export a context-wrapped `useCouponById` from the context.

**`src/screens/CouponsScreen.tsx`** — read coupon list from `useCoupons()` instead of importing `coupons` directly.

**`src/screens/HomeScreen.tsx`** — featured coupon read via `useCoupons().couponById("c1")`.

**`src/screens/CouponDetailScreen.tsx`** — read from `useCoupons()`.

**`src/screens/RewardsScreen.tsx`** — full rebuild:
- Header: "리워드 / Rewards" + subtitle
- `RewardStampRing` showing `count / 10`
- 10-slot grid (5×2): filled slots show vendor emoji + small date; empty slots show a light dashed circle
- CTA states:
  - 0–9: muted text "방문해서 스탬프 모으기 / Visit vendors to collect stamps"
  - 10/10: primary "리워드 선택하기 / Choose your reward" → opens `AppBottomSheet`
- Sheet: 3 stacked reward cards (title + "30일간 유효 / Valid 30 days"). Tap → confirm → `claim()` → sheet closes, toast, stamps reset
- Footer line: "지금까지 받은 리워드 N개 / N rewards claimed"

**`src/components/app/RewardStampRing.tsx`** — Korean-only label `스탬프 진행`, English `Stamp progress` via `useLanguage()`. Default `total` = 10. `MilestoneCard` removed (not used in new design).

**`src/screens/VendorDetailScreen.tsx`** — replace the existing "스탬프 적립 / Collect stamp" button (which currently just navigates to `/rewards`) with a real check-in:
- Calls `addStamp(store.id)`
- Disabled state with text "오늘 적립 완료 / Stamped today" if already stamped today for this vendor
- Success toast: "스탬프 +1 / +1 stamp" with subtitle showing N/10

### Out of scope
Per-visit (vs per-day) lockout, tier badges, server validation. Existing static `coupons` import stays available as the seed but consumers migrate to context.

### File checklist
- New: `src/data/rewards.ts`, `src/contexts/CouponsContext.tsx`, `src/contexts/RewardsContext.tsx`
- Edit: `src/App.tsx`, `src/screens/RewardsScreen.tsx`, `src/components/app/RewardStampRing.tsx`, `src/screens/VendorDetailScreen.tsx`, `src/screens/CouponsScreen.tsx`, `src/screens/HomeScreen.tsx`, `src/screens/CouponDetailScreen.tsx`