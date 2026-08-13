-- ============================================================
-- RoadToMajor — Esquema de base de datos Supabase (Postgres)
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase, o vía Supabase CLI:
--   supabase db push
--
-- Si ya tenías la tabla vieja `saves` de una versión anterior,
-- podés migrarla con:
--   alter table saves rename to players_carrer;
-- (o simplemente correr este script: usa `create table if not exists`,
-- así que no rompe nada si `players_carrer` ya existe.)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- players: perfil mínimo asociado a un usuario (auth.users o anónimo)
-- ------------------------------------------------------------
create table if not exists players (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete cascade,
  display_name text not null default 'Anon1337',
  created_at timestamptz not null default now()
);

create index if not exists idx_players_user_id on players (user_id);

-- ------------------------------------------------------------
-- players_carrer: estado completo de la carrera guardada (una
-- por usuario, se hace upsert). El personaje completo —stats,
-- equipo, contrato, inventario, historial de partidos, feed de
-- prensa, rival, etc.— viaja serializado en la columna
-- `character` (jsonb) para no tener que normalizar toda la
-- estructura del simulador en columnas separadas.
-- ------------------------------------------------------------
create table if not exists players_carrer (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null default 'anon', -- acepta 'anon' para partidas sin login
  character jsonb not null, -- stats, equipo, contrato, inventario, historia, rival, prensa
  phase text not null check (phase in ('faceit', 'tier3', 'tier2', 'tier1', 'major')),
  month integer not null default 0,
  log text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists idx_players_carrer_user_id on players_carrer (user_id);
-- Índice funcional para consultar por equipo actual o contrato sin traer todo el jsonb
create index if not exists idx_players_carrer_team on players_carrer using gin ((character -> 'team'));

-- ------------------------------------------------------------
-- leaderboard: carreras finalizadas, ranking global
-- ------------------------------------------------------------
create table if not exists leaderboard (
  id uuid primary key default uuid_generate_v4(),
  nickname text not null,
  titles integer not null default 0,
  hltv_rating numeric(4, 2) not null default 0,
  prize_money_usd integer not null default 0,
  final_team text,
  region text check (region in ('SA', 'NA', 'EU')),
  created_at timestamptz not null default now()
);

create index if not exists idx_leaderboard_rating on leaderboard (hltv_rating desc);
create index if not exists idx_leaderboard_prize on leaderboard (prize_money_usd desc);
create index if not exists idx_leaderboard_region on leaderboard (region);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table players enable row level security;
alter table players_carrer enable row level security;
alter table leaderboard enable row level security;

-- players: cada usuario ve/edita solo su propio registro
create policy "players_select_own" on players
  for select using (auth.uid() = user_id);
create policy "players_insert_own" on players
  for insert with check (auth.uid() = user_id);
create policy "players_update_own" on players
  for update using (auth.uid() = user_id);

-- players_carrer: lectura/escritura abierta por user_id (incluye 'anon')
-- En producción con auth real, restringir a auth.uid()::text = user_id
create policy "players_carrer_select_all" on players_carrer
  for select using (true);
create policy "players_carrer_upsert_all" on players_carrer
  for insert with check (true);
create policy "players_carrer_update_all" on players_carrer
  for update using (true);

-- leaderboard: lectura pública, inserción pública (juego sin login obligatorio)
create policy "leaderboard_select_all" on leaderboard
  for select using (true);
create policy "leaderboard_insert_all" on leaderboard
  for insert with check (true);

-- ------------------------------------------------------------
-- Trigger: mantener updated_at al día en players_carrer
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_players_carrer_updated_at on players_carrer;
create trigger trg_players_carrer_updated_at
  before update on players_carrer
  for each row execute function set_updated_at();
