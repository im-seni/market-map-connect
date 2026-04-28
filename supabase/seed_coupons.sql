-- ================================================================
-- 데모 쿠폰 시드 — 사용자별로 다른 쿠폰 (active / used / expired)
-- Supabase Dashboard → SQL Editor에서 실행 (postgres, RLS 우회)
--
-- 규칙: 가입 순서 기준 1번째·2번째 사용자(auth.users, created_at ASC)에게만 넣습니다.
-- 다시 실행하면 template_id 가 `seed-demo-%` 인 행만 해당 사용자들에서 지우고 다시 넣습니다.
-- ================================================================

WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at ASC) AS rn
  FROM auth.users
),
removed AS (
  DELETE FROM public.coupons c
  USING ranked r
  WHERE c.user_id = r.id
    AND r.rn IN (1, 2)
    AND c.template_id LIKE 'seed-demo-%'
  RETURNING c.id
)
INSERT INTO public.coupons (user_id, template_id, vendor_id, title_ko, title_en, expires_at, state)
SELECT r.id, v.template_id, v.vendor_id, v.title_ko, v.title_en, v.expires_at::date, v.state
FROM (VALUES
  -- ── 1번째 사용자: 기존 데모 카드와 비슷한 구성 (사용가능 2 + 사용함 1 + 만료 1)
  (1::bigint, 'seed-demo-u1-king', '1', '왕꼬치 ₩2,000 할인', '₩2,000 off King Skewer', '2026-06-30', 'active'),
  (1::bigint, 'seed-demo-u1-bubble', '3', '버블티 무료 사이즈업', 'Free bubble tea size-up', '2026-06-30', 'active'),
  (1::bigint, 'seed-demo-u1-takoyaki', '2', '타코야끼 세트 10% 할인', '10% off takoyaki set', '2026-03-01', 'used'),
  (1::bigint, 'seed-demo-u1-welcome-drink', '3', '야시장 웰컴 음료 1잔', 'Free welcome drink', '2025-12-31', 'expired'),
  -- ── 2번째 사용자: 다른 매장/혜택 조합
  (2::bigint, 'seed-demo-u2-yacht', '15', '팔미도 미니 요트 50% 할인', 'Palmido mini yacht 50% off', '2026-08-31', 'active'),
  (2::bigint, 'seed-demo-u2-king', '1', '왕꼬치 ₩1,000 할인 (회원 전용)', '₩1,000 off King Skewer (members)', '2026-07-15', 'active'),
  (2::bigint, 'seed-demo-u2-foodzone', '2', '먹거리존 ₩500 할인', '₩500 off food court', '2026-05-01', 'used'),
  (2::bigint, 'seed-demo-u2-welcome', '1', '신규 가입 웰컴 쿠폰', 'Welcome signup coupon', '2025-06-01', 'expired')
) AS v(rn, template_id, vendor_id, title_ko, title_en, expires_at, state)
JOIN ranked r ON r.rn = v.rn;

-- 확인
-- SELECT u.email, c.state, c.title_ko, c.template_id
-- FROM public.coupons c
-- JOIN auth.users u ON u.id = c.user_id
-- WHERE c.template_id LIKE 'seed-demo-%'
-- ORDER BY u.email, c.state;

-- ── (선택) 이메일로 특정 두 계정만 넣고 싶을 때 — 위 전체를 실행하지 말고 아래만 수정해 실행
--
-- DELETE FROM public.coupons
-- WHERE template_id LIKE 'seed-demo-%'
--   AND user_id IN (SELECT id FROM auth.users WHERE email IN ('user-a@example.com', 'user-b@example.com'));
--
-- INSERT INTO public.coupons (user_id, template_id, vendor_id, title_ko, title_en, expires_at, state)
-- SELECT u.id, v.template_id, v.vendor_id, v.title_ko, v.title_en, v.expires_at::date, v.state
-- FROM auth.users u
-- JOIN (VALUES
--   ('user-a@example.com', 'seed-demo-u1-king', '1', '왕꼬치 ₩2,000 할인', '₩2,000 off King Skewer', '2026-06-30', 'active'),
--   ('user-b@example.com', 'seed-demo-u2-yacht', '15', '팔미도 미니 요트 50% 할인', 'Palmido mini yacht 50% off', '2026-08-31', 'active')
-- ) AS v(email, template_id, vendor_id, title_ko, title_en, expires_at, state)
--   ON lower(u.email) = lower(v.email);
