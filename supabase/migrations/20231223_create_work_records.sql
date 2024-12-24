create table if not exists public.work_records (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  name text not null,
  company text not null,
  location text not null,
  start_time time not null,
  end_time time not null,
  day_hours integer not null,
  night_hours integer default 0,
  late_night_hours integer default 0,
  extra_amount integer default 0,
  memo text,
  user_id uuid references auth.users(id)
);

-- RLS 정책 설정
alter table public.work_records enable row level security;

create policy "사용자는 자신의 작업 기록만 볼 수 있음"
  on public.work_records for select
  using (auth.uid() = user_id);

create policy "사용자는 자신의 작업 기록만 생성할 수 있음"
  on public.work_records for insert
  with check (auth.uid() = user_id);

create policy "사용자는 자신의 작업 기록만 수정할 수 있음"
  on public.work_records for update
  using (auth.uid() = user_id);

create policy "사용자는 자신의 작업 기록만 삭제할 수 있음"
  on public.work_records for delete
  using (auth.uid() = user_id);
