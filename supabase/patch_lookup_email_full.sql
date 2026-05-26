-- 이메일 찾기: 닉네임 일치 시 전체 이메일 반환 (마스킹 제거)
-- SQL Editor에서 실행

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
