-- Supabase (PostgreSQL) 초안 — 대시보드 SQL 에디터 또는 CLI 마이그레이션에 붙여 넣어 사용.
-- Auth는 Supabase Auth(auth.users). 앱 프로필·마케팅 동의 등은 public.profiles에 둡니다.

-- 1) 프로필 테이블 (유저 식별: id = auth.users.id = JWT sub)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  locale text default 'ko' check (locale in ('ko', 'en')),
  marketing_opt_in boolean not null default false,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- insert는 가입 직후 아래 트리거(security definer)로만 수행 — 별도 insert 정책 없음.

-- 2) 가입 시 auth.users → profiles 복제
--    signUp 시 options.data: { display_name, marketing_opt_in } 를 raw_user_meta_data에 넣고 아래에서 읽습니다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, marketing_opt_in, locale)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), ''),
    coalesce((new.raw_user_meta_data->>'marketing_opt_in')::boolean, false),
    coalesce(nullif(new.raw_user_meta_data->>'locale', ''), 'ko')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3) updated_at 자동 갱신 (선택)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated on public.profiles;
create trigger profiles_set_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();
