-- ─────────────────────────────────────────────────────────────
-- CS Hub · Supabase 建表脚本
-- 在 Supabase 项目 → SQL Editor 中直接执行。
-- 之后将项目 URL 和 anon key 填入 algo-viz/.env.local：
--   VITE_SUPABASE_URL=https://xxx.supabase.co
--   VITE_SUPABASE_ANON_KEY=eyJ...
-- ─────────────────────────────────────────────────────────────

-- 1) 用户进度（收藏 / 已学完）
create table if not exists public.user_progress (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  slug       text        not null,
  completed  boolean     not null default false,
  favorited  boolean     not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, slug)
);

alter table public.user_progress enable row level security;

drop policy if exists "own progress select" on public.user_progress;
create policy "own progress select" on public.user_progress
  for select using (user_id = auth.uid());

drop policy if exists "own progress upsert" on public.user_progress;
create policy "own progress upsert" on public.user_progress
  for insert with check (user_id = auth.uid());

drop policy if exists "own progress update" on public.user_progress;
create policy "own progress update" on public.user_progress
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own progress delete" on public.user_progress;
create policy "own progress delete" on public.user_progress
  for delete using (user_id = auth.uid());


-- 2) 测验成绩
create table if not exists public.user_quiz_scores (
  user_id   uuid        not null references auth.users(id) on delete cascade,
  slug      text        not null,
  attempted int         not null default 0,
  correct   int         not null default 0,
  total     int         not null default 0,
  last_at   timestamptz not null default now(),
  primary key (user_id, slug)
);

alter table public.user_quiz_scores enable row level security;

drop policy if exists "own quiz select" on public.user_quiz_scores;
create policy "own quiz select" on public.user_quiz_scores
  for select using (user_id = auth.uid());

drop policy if exists "own quiz upsert" on public.user_quiz_scores;
create policy "own quiz upsert" on public.user_quiz_scores
  for insert with check (user_id = auth.uid());

drop policy if exists "own quiz update" on public.user_quiz_scores;
create policy "own quiz update" on public.user_quiz_scores
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own quiz delete" on public.user_quiz_scores;
create policy "own quiz delete" on public.user_quiz_scores
  for delete using (user_id = auth.uid());


-- 3) 启用 Realtime（让跨设备实时同步生效）
alter publication supabase_realtime add table public.user_progress;
alter publication supabase_realtime add table public.user_quiz_scores;


-- ─────────────────────────────────────────────────────────────
-- 里程碑 2 预备表（笔记 + 徽章 + 路径 + 打卡）
-- 可与上面同时执行，前端在里程碑 2 才会用到。
-- ─────────────────────────────────────────────────────────────

create table if not exists public.notes (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  slug       text        not null,
  content    text        not null default '',
  is_public  boolean     not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists notes_slug_idx on public.notes(slug);
create index if not exists notes_user_idx on public.notes(user_id);

alter table public.notes enable row level security;

drop policy if exists "own notes all" on public.notes;
create policy "own notes all" on public.notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "public notes readable" on public.notes;
create policy "public notes readable" on public.notes
  for select using (is_public = true);


create table if not exists public.user_streaks (
  user_id           uuid        primary key references auth.users(id) on delete cascade,
  current_streak    int         not null default 0,
  longest_streak    int         not null default 0,
  last_active_date  date        not null default current_date
);

alter table public.user_streaks enable row level security;
drop policy if exists "own streak all" on public.user_streaks;
create policy "own streak all" on public.user_streaks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());


create table if not exists public.user_achievements (
  user_id        uuid        not null references auth.users(id) on delete cascade,
  achievement_id text        not null,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;
drop policy if exists "own achievements all" on public.user_achievements;
create policy "own achievements all" on public.user_achievements
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());


create table if not exists public.user_path_progress (
  user_id       uuid        not null references auth.users(id) on delete cascade,
  path_id       text        not null,
  current_index int         not null default 0,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  primary key (user_id, path_id)
);

alter table public.user_path_progress enable row level security;
drop policy if exists "own path progress" on public.user_path_progress;
create policy "own path progress" on public.user_path_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
