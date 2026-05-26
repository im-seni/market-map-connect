-- ================================================================
-- ⚠️ 이 파일만 실행하면 23505 에러가 납니다!
--    (profiles에 seeun 같은 중복 닉네임이 남아 있을 때)
--
-- ✅ 처음부터 맞추려면 대신 실행:
--    supabase/reset_users_and_apply.sql  (전체 복붙 → Run)
--
-- 아래는 "데이터 삭제 + 유니크 인덱스"만 빠르게 할 때 (개발 DB 전용)
-- ================================================================

begin;

drop index if exists public.profiles_display_name_lower_idx;
drop index if exists public.profiles_display_name_unique_idx;

-- 인덱스 만들기 전에 반드시 비우기 (순서 중요: 자식 테이블 → profiles → auth)
truncate table public.saved_stores;
truncate table public.coupons;
truncate table public.stamp_cards;
truncate table public.visit_log;
truncate table public.stamps;
truncate table public.profiles;

delete from auth.users;

-- 중복이 남았으면 여기서 멈춤 (인덱스 생성 전 검사)
do $$
declare
  v_dupes int;
begin
  select count(*) into v_dupes
  from (
    select lower(trim(display_name)) as nick
    from public.profiles
    where display_name is not null and trim(display_name) <> ''
    group by 1
    having count(*) > 1
  ) d;

  if v_dupes > 0 then
    raise exception
      'profiles에 중복 닉네임이 %건 남아 있습니다. reset_users_and_apply.sql 을 실행하세요.',
      v_dupes;
  end if;
end $$;

create unique index profiles_display_name_unique_idx
  on public.profiles (lower(trim(display_name)))
  where display_name is not null and trim(display_name) <> '';

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

commit;
