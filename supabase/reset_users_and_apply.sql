-- ================================================================
-- [주의] 개발/초기화용 — 모든 가입 유저·연관 데이터 삭제 후 정책 재적용
--
-- 삭제 대상: auth.users 및 profiles / 쿠폰 / 스탬프 / 방문·찜 등
-- 적용 내용:
--   · 닉네임 중복 불가 (DB 유니크 + is_display_name_available)
--   · 닉네임으로 가입 이메일 전체 조회 (lookup_email_hint)
--   · 신규 가입 시 환영 쿠폰 (handle_new_user 트리거)
--
-- Supabase Dashboard → SQL Editor → 전체 붙여넣기 → Run
-- 프로덕션 실사용 DB에서는 실행하지 마세요.
-- ================================================================

begin;

-- ── 1) 유저 데이터 전부 삭제 (순서 중요!) ────────────────────────
-- auth.users 만 먼저 지우면 CASCADE 미적용·고아 profiles 가 남을 수 있습니다.
-- → profiles 에 seeun 중복이 남은 채 인덱스 생성 시 23505 발생
drop index if exists public.profiles_display_name_lower_idx;
drop index if exists public.profiles_display_name_unique_idx;

truncate table public.saved_stores;
truncate table public.coupons;
truncate table public.stamp_cards;
truncate table public.visit_log;
truncate table public.stamps;
truncate table public.profiles;

delete from auth.users;

do $$
declare
  v_profile_count int;
  v_dupe_count    int;
begin
  select count(*) into v_profile_count from public.profiles;

  select count(*) into v_dupe_count
  from (
    select lower(trim(display_name)) as nick
    from public.profiles
    where display_name is not null and trim(display_name) <> ''
    group by 1
    having count(*) > 1
  ) d;

  if v_profile_count > 0 or v_dupe_count > 0 then
    raise exception
      '삭제 실패: profiles %행, 중복 닉네임 %건 남음. SQL Editor 권한 또는 FK를 확인하세요.',
      v_profile_count, v_dupe_count;
  end if;
end $$;

-- ── 2) 닉네임 유니크 인덱스 ─────────────────────────────────────
create unique index profiles_display_name_unique_idx
  on public.profiles (lower(trim(display_name)))
  where display_name is not null and trim(display_name) <> '';

-- ── 3) 공통 유틸 ─────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated on public.profiles;
create trigger profiles_set_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.mask_email(p_email text)
returns text
language sql
immutable
as $$
  select case
    when p_email is null or position('@' in p_email) = 0 then null
    else
      left(split_part(p_email, '@', 1), 1)
      || repeat('*', greatest(2, char_length(split_part(p_email, '@', 1)) - 1))
      || '@'
      || split_part(p_email, '@', 2)
  end;
$$;

-- ── 4) 가입 전 닉네임 중복 검사 (앱 signUp에서 호출) ─────────────
create or replace function public.is_display_name_available(p_display_name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1
    from public.profiles p
    where lower(trim(coalesce(p.display_name, ''))) = lower(trim(coalesce(p_display_name, '')))
      and trim(coalesce(p_display_name, '')) <> ''
  );
$$;

revoke all on function public.is_display_name_available(text) from public;
grant execute on function public.is_display_name_available(text) to anon, authenticated;

-- ── 5) 닉네임 → 마스킹 이메일 힌트 (이메일 찾기) ─────────────────
create or replace function public.lookup_email_hint(p_display_name text)
returns table (email_hint text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := lower(trim(coalesce(p_display_name, '')));
begin
  if char_length(v_name) < 2 then
    return;
  end if;

  return query
  select trim(p.email)
  from public.profiles p
  where lower(trim(coalesce(p.display_name, ''))) = v_name
    and p.email is not null
    and trim(p.email) <> ''
  limit 1;
end;
$$;

revoke all on function public.lookup_email_hint(text) from public;
grant execute on function public.lookup_email_hint(text) to anon, authenticated;

-- ── 6) 가입 시 profiles + 신규 환영 쿠폰 ─────────────────────────
-- display_name 유니크 위반 시 트리거 실패 → auth.users insert 도 롤백됩니다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_name text := nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), '');
begin
  insert into public.profiles (id, email, display_name, marketing_opt_in, locale)
  values (
    new.id,
    new.email,
    v_display_name,
    coalesce((new.raw_user_meta_data->>'marketing_opt_in')::boolean, false),
    coalesce(nullif(new.raw_user_meta_data->>'locale', ''), 'ko')
  )
  on conflict (id) do update set
    email            = excluded.email,
    display_name     = excluded.display_name,
    marketing_opt_in = excluded.marketing_opt_in,
    locale           = excluded.locale,
    updated_at       = now();

  if new.email is not null and length(btrim(new.email)) > 0 then
    if not exists (
      select 1
      from public.coupons c
      where c.user_id = new.id
        and c.template_id = 'welcome-signup-v1'
    ) then
      insert into public.coupons (
        user_id, template_id, vendor_id, title_ko, title_en, expires_at, state
      )
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
  for each row execute function public.handle_new_user();

-- ── 7) 스탬프 클레임 · 계정 삭제 (기존 앱 RPC) ───────────────────
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

    insert into public.coupons (
      id, user_id, template_id, vendor_id, title_ko, title_en, expires_at, state
    )
    values (
      v_coupon_id, v_uid, 'yacht-50', '15',
      '팔미도 미니 요트 50% 할인', 'Palmido mini yacht 50% off',
      v_expires_at, 'active'
    );

    delete from public.stamps where user_id = v_uid;

    insert into public.stamp_cards (user_id, claimed_count)
    values (v_uid, 1)
    on conflict (user_id) do update set
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

commit;

-- ── 실행 후 확인 (선택) ──────────────────────────────────────────
-- select count(*) as users from auth.users;
-- select count(*) as profiles from public.profiles;
-- select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public' and proname in (
--     'is_display_name_available', 'lookup_email_hint', 'handle_new_user'
--   );
