-- 계정 찾기: 닉네임 → 마스킹된 이메일 힌트
-- Supabase Dashboard > SQL Editor에서 실행

-- 닉네임 유니크: patch_unique_display_name.sql 실행 권장

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
