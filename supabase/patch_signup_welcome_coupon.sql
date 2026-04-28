-- ================================================================
-- 기존 프로젝트용 패치: 가입 시 환영 쿠폰 자동 발급
-- (이미 schema.sql 예전 버전을 적용한 뒤라면) SQL Editor에서 한 번 실행
-- ================================================================

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
