-- ================================================================
-- market-map-connect — Supabase 전체 스키마
-- Supabase Dashboard > SQL Editor에 붙여넣어 실행
-- ================================================================

-- ── 1. profiles ──────────────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  email            text,
  display_name     text,
  locale           text not null default 'ko' check (locale in ('ko', 'en')),
  marketing_opt_in boolean not null default false,
  avatar_url       text,
  phone            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

create unique index if not exists profiles_display_name_unique_idx
  on public.profiles (lower(trim(display_name)))
  where display_name is not null and trim(display_name) <> '';

alter table public.profiles enable row level security;

create policy "profiles: select own"
  on public.profiles for select using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update using (auth.uid() = id);

-- 가입 시 profiles + 환영 쿠폰: `public.coupons` 생성 이후(아래 섹션)에서 트리거 정의

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_set_updated on public.profiles;
create trigger profiles_set_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── 2. stamps ─────────────────────────────────────────────────────
create table if not exists public.stamps (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  vendor_id    text not null,
  collected_on date not null,
  collected_at timestamptz not null default now(),
  unique (user_id, vendor_id, collected_on)
);

create index if not exists stamps_user_collected
  on public.stamps (user_id, collected_at desc);

alter table public.stamps enable row level security;

create policy "stamps: own rows only"
  on public.stamps for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 3. visit_log ──────────────────────────────────────────────────
create table if not exists public.visit_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  vendor_id  text not null,
  visited_on date not null,
  visited_at timestamptz not null default now()
);

create index if not exists visit_log_user_visited
  on public.visit_log (user_id, visited_at desc);

alter table public.visit_log enable row level security;

create policy "visit_log: own rows only"
  on public.visit_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 4. stamp_cards (누적 클레임 횟수) ─────────────────────────────
create table if not exists public.stamp_cards (
  user_id       uuid primary key references auth.users on delete cascade,
  claimed_count int not null default 0,
  updated_at    timestamptz not null default now()
);

alter table public.stamp_cards enable row level security;

create policy "stamp_cards: own row only"
  on public.stamp_cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 5. coupons ────────────────────────────────────────────────────
create table if not exists public.coupons (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  template_id text not null,
  vendor_id   text not null,
  title_ko    text not null,
  title_en    text not null,
  expires_at  date not null,
  state       text not null default 'active'
              check (state in ('active', 'used', 'expired')),
  created_at  timestamptz not null default now()
);

create index if not exists coupons_user_state
  on public.coupons (user_id, state);

alter table public.coupons enable row level security;

create policy "coupons: own rows only"
  on public.coupons for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 가입 시 auth.users → profiles + 신규 환영 쿠폰 (security definer, RLS 우회)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, marketing_opt_in, locale)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), ''),
    coalesce((new.raw_user_meta_data->>'marketing_opt_in')::boolean, false),
    coalesce(nullif(new.raw_user_meta_data->>'locale', ''), 'ko')
  )
  on conflict (id) do nothing;

  -- 이메일이 있는 가입만 (익명 세션 등은 제외)
  if new.email is not null and length(btrim(new.email)) > 0 then
    if not exists (
      select 1 from public.coupons c
      where c.user_id = new.id and c.template_id = 'welcome-signup-v1'
    ) then
      insert into public.coupons (user_id, template_id, vendor_id, title_ko, title_en, expires_at, state)
      values (
        new.id,
        'welcome-signup-v1',
        '1',
        '신규 가입 감사 · 왕꼬치 ₩2,000 할인',
        'Welcome — ₩2,000 off King Skewer',
        (current_date + interval '30 days')::date,
        'active'
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 6. saved_stores (찜) ─────────────────────────────────────────
create table if not exists public.saved_stores (
  user_id  uuid not null references auth.users on delete cascade,
  store_id text not null,
  saved_at timestamptz not null default now(),
  primary key (user_id, store_id)
);

alter table public.saved_stores enable row level security;

create policy "saved_stores: own rows only"
  on public.saved_stores for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 7. claim_stamp (원자적: 스탬프 + 방문기록 + 선택적 쿠폰+리셋) ──
create or replace function public.claim_stamp(
  p_vendor_id    text,
  p_collected_on date,
  p_collected_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid         uuid := auth.uid();
  v_stamp_count int;
  v_coupon_id   uuid;
  v_expires_at  date;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  -- unique constraint: 같은 vendor, 같은 날 → 중복 무시
  insert into public.stamps (user_id, vendor_id, collected_on, collected_at)
  values (v_uid, p_vendor_id, p_collected_on, p_collected_at)
  on conflict (user_id, vendor_id, collected_on) do nothing;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'already_stamped_today');
  end if;

  insert into public.visit_log (user_id, vendor_id, visited_on, visited_at)
  values (v_uid, p_vendor_id, p_collected_on, p_collected_at);

  select count(*) into v_stamp_count
  from public.stamps
  where user_id = v_uid;

  if v_stamp_count >= 5 then
    v_expires_at := current_date + interval '30 days';
    v_coupon_id  := gen_random_uuid();

    insert into public.coupons
      (id, user_id, template_id, vendor_id, title_ko, title_en, expires_at, state)
    values
      (v_coupon_id, v_uid, 'yacht-50', '15',
       '팔미도 미니 요트 50% 할인', 'Palmido mini yacht 50% off',
       v_expires_at, 'active');

    delete from public.stamps where user_id = v_uid;

    insert into public.stamp_cards (user_id, claimed_count)
    values (v_uid, 1)
    on conflict (user_id)
    do update set
      claimed_count = stamp_cards.claimed_count + 1,
      updated_at    = now();

    return jsonb_build_object(
      'ok', true, 'stamp_count', 0, 'reward', true, 'coupon_id', v_coupon_id
    );
  end if;

  return jsonb_build_object(
    'ok', true, 'stamp_count', v_stamp_count, 'reward', false
  );
end;
$$;

-- ── 8. delete_user (클라이언트에서 본인 계정 삭제) ───────────────
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
