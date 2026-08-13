-- En qué gasto? — esquema de base de datos para Supabase
-- Pegar y correr en el SQL editor de tu proyecto de Supabase.

create extension if not exists "pgcrypto";

-- ACCOUNTS ------------------------------------------------------------
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  currency text not null default 'ARS',
  created_at timestamptz not null default now()
);

alter table accounts enable row level security;

drop policy if exists "accounts_select_own" on accounts;
create policy "accounts_select_own" on accounts
  for select using (auth.uid() = user_id);
drop policy if exists "accounts_insert_own" on accounts;
create policy "accounts_insert_own" on accounts
  for insert with check (auth.uid() = user_id);
drop policy if exists "accounts_update_own" on accounts;
create policy "accounts_update_own" on accounts
  for update using (auth.uid() = user_id);
drop policy if exists "accounts_delete_own" on accounts;
create policy "accounts_delete_own" on accounts
  for delete using (auth.uid() = user_id);

-- CATEGORIES ------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('gasto', 'ingreso')),
  color text not null default '#C8402A',
  icon text
);

alter table categories enable row level security;

drop policy if exists "categories_select_own" on categories;
create policy "categories_select_own" on categories
  for select using (auth.uid() = user_id);
drop policy if exists "categories_insert_own" on categories;
create policy "categories_insert_own" on categories
  for insert with check (auth.uid() = user_id);
drop policy if exists "categories_update_own" on categories;
create policy "categories_update_own" on categories
  for update using (auth.uid() = user_id);
drop policy if exists "categories_delete_own" on categories;
create policy "categories_delete_own" on categories
  for delete using (auth.uid() = user_id);

-- TRANSACTIONS ------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete restrict,
  category_id uuid references categories(id) on delete set null,
  kind text not null check (kind in ('gasto', 'ingreso')),
  amount numeric(14,2) not null check (amount > 0),
  description text,
  payment_method text not null default 'transferencia_qr'
    check (payment_method in ('efectivo', 'debito', 'credito', 'transferencia_qr')),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_occurred_idx
  on transactions (user_id, occurred_at desc);

alter table transactions enable row level security;

drop policy if exists "transactions_select_own" on transactions;
create policy "transactions_select_own" on transactions
  for select using (auth.uid() = user_id);
drop policy if exists "transactions_insert_own" on transactions;
create policy "transactions_insert_own" on transactions
  for insert with check (auth.uid() = user_id);
drop policy if exists "transactions_update_own" on transactions;
create policy "transactions_update_own" on transactions
  for update using (auth.uid() = user_id);
drop policy if exists "transactions_delete_own" on transactions;
create policy "transactions_delete_own" on transactions
  for delete using (auth.uid() = user_id);

-- APP STATS (contador público de gente registrada) ------------------------
-- Una sola fila que se incrementa sola cada vez que alguien crea una cuenta.
-- Es de lectura pública (para mostrarla en la landing antes del login) pero
-- nadie puede escribirla desde el cliente: solo la actualiza el trigger.
create table if not exists public.app_stats (
  id int primary key default 1,
  users_count int not null default 0,
  constraint app_stats_single_row check (id = 1)
);

insert into public.app_stats (id, users_count)
values (1, 0)
on conflict (id) do nothing;

alter table public.app_stats enable row level security;

drop policy if exists "app_stats_public_read" on public.app_stats;
create policy "app_stats_public_read" on public.app_stats
  for select using (true);
-- (sin políticas de insert/update/delete: el cliente no puede tocar esta tabla)

create or replace function public.handle_new_user_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.app_stats set users_count = users_count + 1 where id = 1;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_stats on auth.users;
create trigger on_auth_user_created_stats
  after insert on auth.users
  for each row execute function public.handle_new_user_stats();

-- Opcional: si querés arrancar mostrando un número base en vez de 0
-- (por ejemplo porque ya tenías usuarios de antes, o simplemente para no
-- lanzar la landing con "0 personas"), corré esto una vez con el número que
-- quieras:
-- update public.app_stats set users_count = 120 where id = 1;

-- MIGRACIÓN: medio de pago + protección al borrar cuentas ------------------
-- Si ya habías corrido este schema antes, corré solo este bloque de acá para
-- abajo (es seguro correrlo de nuevo, usa IF NOT EXISTS / DROP...CREATE).

-- Medio de pago de cada movimiento. Por defecto "transferencia_qr", para que
-- quien no quiera pensar en esto no tenga que tocar nada.
alter table transactions
  add column if not exists payment_method text
  not null default 'transferencia_qr';

alter table transactions
  drop constraint if exists transactions_payment_method_check;

alter table transactions
  add constraint transactions_payment_method_check
  check (payment_method in ('efectivo', 'debito', 'credito', 'transferencia_qr'));

-- Antes, borrar una cuenta borraba en cascada todos sus movimientos sin
-- avisar. Ahora Postgres va a rechazar el borrado si la cuenta tiene
-- movimientos cargados, para que no se pierdan datos por error. La app ya
-- verifica esto antes de intentar borrar y muestra un aviso claro.
alter table accounts
  drop constraint if exists accounts_user_id_fkey;
alter table accounts
  add constraint accounts_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table transactions
  drop constraint if exists transactions_account_id_fkey;
alter table transactions
  add constraint transactions_account_id_fkey
  foreign key (account_id) references accounts(id) on delete restrict;

-- ============================================================================
-- MIGRACIÓN 2: Casa compartida, tarjetas con cuotas, metas de ahorro
-- ============================================================================
-- Es segura de correr de nuevo (usa IF NOT EXISTS / DROP...CREATE en todos
-- lados). Corré este archivo completo en el SQL Editor de Supabase.

-- Función helper: ¿el usuario actual es miembro de esta casa?
-- security definer para poder usarse dentro de las políticas de RLS de otras
-- tablas sin generar recursión.
create or replace function public.is_household_member(hid uuid)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return exists (
    select 1 from household_members
    where household_id = hid and user_id = auth.uid()
  );
end;
$$;

-- HOUSEHOLDS ("casa") -------------------------------------------------------
create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  invite_code text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  created_at timestamptz not null default now()
);

alter table households enable row level security;

drop policy if exists "households_select_member" on households;
create policy "households_select_member" on households
  for select using (owner_id = auth.uid() or public.is_household_member(id));

drop policy if exists "households_insert_own" on households;
create policy "households_insert_own" on households
  for insert with check (owner_id = auth.uid());

drop policy if exists "households_update_owner" on households;
create policy "households_update_owner" on households
  for update using (owner_id = auth.uid());

drop policy if exists "households_delete_owner" on households;
create policy "households_delete_owner" on households
  for delete using (owner_id = auth.uid());

-- HOUSEHOLD MEMBERS -----------------------------------------------------------
create table if not exists household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  unique (household_id, user_id)
);

alter table household_members enable row level security;

drop policy if exists "household_members_select" on household_members;
create policy "household_members_select" on household_members
  for select using (user_id = auth.uid() or public.is_household_member(household_id));

drop policy if exists "household_members_delete_self" on household_members;
create policy "household_members_delete_self" on household_members
  for delete using (user_id = auth.uid());
-- (no hay policy de insert directa: te sumás a una casa solo a través de la
-- función join_household_by_code de más abajo, que corre con permisos
-- elevados y valida el código de invitación)

-- Al crear una casa, el creador queda como owner automáticamente.
create or replace function public.handle_new_household()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into household_members (household_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (household_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_household_created on households;
create trigger on_household_created
  after insert on households
  for each row execute function public.handle_new_household();

-- Unirse a una casa con el código de invitación.
create or replace function public.join_household_by_code(code text)
returns households
language plpgsql
security definer
set search_path = public
as $$
declare
  h households;
begin
  select * into h from households where invite_code = code;
  if h.id is null then
    raise exception 'Código de invitación inválido';
  end if;
  insert into household_members (household_id, user_id, role)
  values (h.id, auth.uid(), 'member')
  on conflict (household_id, user_id) do nothing;
  return h;
end;
$$;

grant execute on function public.join_household_by_code(text) to authenticated;
grant execute on function public.is_household_member(uuid) to authenticated;

-- CUENTAS: ahora pueden pertenecer a una casa (visibles para todos sus
-- miembros) o ser personales (solo vos), igual que antes.
alter table accounts add column if not exists household_id uuid references households(id) on delete set null;

drop policy if exists "accounts_select_own" on accounts;
create policy "accounts_select_own" on accounts
  for select using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );
-- insert/update/delete de cuentas: se mantienen solo para quien la creó.

-- MOVIMIENTOS: visibles para toda la casa si están en una cuenta compartida;
-- cualquier miembro puede cargar movimientos en esa cuenta; cada quien edita
-- y borra únicamente lo que cargó.
drop policy if exists "transactions_select_own" on transactions;
create policy "transactions_select_own" on transactions
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from accounts a
      where a.id = transactions.account_id
        and a.household_id is not null
        and public.is_household_member(a.household_id)
    )
  );

drop policy if exists "transactions_insert_own" on transactions;
create policy "transactions_insert_own" on transactions
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from accounts a
      where a.id = account_id
        and (
          a.user_id = auth.uid()
          or (a.household_id is not null and public.is_household_member(a.household_id))
        )
    )
  );

-- CATEGORÍAS: si querés que sean visibles para toda la casa, opcionalmente
-- podés setearles household_id también.
alter table categories add column if not exists household_id uuid references households(id) on delete set null;

drop policy if exists "categories_select_own" on categories;
create policy "categories_select_own" on categories
  for select using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );

-- TARJETAS con cuotas ---------------------------------------------------------
create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  household_id uuid references households(id) on delete set null,
  name text not null,
  closing_day smallint not null check (closing_day between 1 and 31),
  due_day smallint not null check (due_day between 1 and 31),
  currency text not null default 'ARS',
  created_at timestamptz not null default now()
);

alter table cards enable row level security;

drop policy if exists "cards_select" on cards;
create policy "cards_select" on cards
  for select using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );
drop policy if exists "cards_insert_own" on cards;
create policy "cards_insert_own" on cards
  for insert with check (auth.uid() = user_id);
drop policy if exists "cards_update_own" on cards;
create policy "cards_update_own" on cards
  for update using (auth.uid() = user_id);
drop policy if exists "cards_delete_own" on cards;
create policy "cards_delete_own" on cards
  for delete using (auth.uid() = user_id);

-- Compras en cuotas. El monto de cada cuota se calcula en la app
-- (total_amount / installments); no se generan filas por cada mes.
create table if not exists card_purchases (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references cards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  description text not null,
  total_amount numeric(14,2) not null check (total_amount > 0),
  installments smallint not null check (installments >= 1),
  first_installment_date date not null,
  created_at timestamptz not null default now()
);

alter table card_purchases enable row level security;

drop policy if exists "card_purchases_select" on card_purchases;
create policy "card_purchases_select" on card_purchases
  for select using (
    exists (
      select 1 from cards c
      where c.id = card_purchases.card_id
        and (
          c.user_id = auth.uid()
          or (c.household_id is not null and public.is_household_member(c.household_id))
        )
    )
  );
drop policy if exists "card_purchases_insert" on card_purchases;
create policy "card_purchases_insert" on card_purchases
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from cards c
      where c.id = card_id
        and (
          c.user_id = auth.uid()
          or (c.household_id is not null and public.is_household_member(c.household_id))
        )
    )
  );
drop policy if exists "card_purchases_update_own" on card_purchases;
create policy "card_purchases_update_own" on card_purchases
  for update using (auth.uid() = user_id);
drop policy if exists "card_purchases_delete_own" on card_purchases;
create policy "card_purchases_delete_own" on card_purchases
  for delete using (auth.uid() = user_id);

-- Marcar un mes de una tarjeta como pagado.
create table if not exists card_payments (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references cards(id) on delete cascade,
  month date not null,
  paid_at timestamptz not null default now(),
  paid_by uuid not null references auth.users(id) on delete cascade,
  unique (card_id, month)
);

alter table card_payments enable row level security;

drop policy if exists "card_payments_select" on card_payments;
create policy "card_payments_select" on card_payments
  for select using (
    exists (
      select 1 from cards c
      where c.id = card_payments.card_id
        and (
          c.user_id = auth.uid()
          or (c.household_id is not null and public.is_household_member(c.household_id))
        )
    )
  );
drop policy if exists "card_payments_insert" on card_payments;
create policy "card_payments_insert" on card_payments
  for insert with check (
    auth.uid() = paid_by
    and exists (
      select 1 from cards c
      where c.id = card_id
        and (
          c.user_id = auth.uid()
          or (c.household_id is not null and public.is_household_member(c.household_id))
        )
    )
  );
drop policy if exists "card_payments_delete" on card_payments;
create policy "card_payments_delete" on card_payments
  for delete using (
    exists (
      select 1 from cards c
      where c.id = card_payments.card_id
        and (
          c.user_id = auth.uid()
          or (c.household_id is not null and public.is_household_member(c.household_id))
        )
    )
  );

-- METAS DE AHORRO ---------------------------------------------------------
create table if not exists savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  household_id uuid references households(id) on delete set null,
  name text not null,
  target_amount numeric(14,2) not null check (target_amount > 0),
  currency text not null default 'ARS',
  target_date date,
  created_at timestamptz not null default now()
);

alter table savings_goals enable row level security;

drop policy if exists "savings_goals_select" on savings_goals;
create policy "savings_goals_select" on savings_goals
  for select using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );
drop policy if exists "savings_goals_insert_own" on savings_goals;
create policy "savings_goals_insert_own" on savings_goals
  for insert with check (auth.uid() = user_id);
drop policy if exists "savings_goals_update_own" on savings_goals;
create policy "savings_goals_update_own" on savings_goals
  for update using (auth.uid() = user_id);
drop policy if exists "savings_goals_delete_own" on savings_goals;
create policy "savings_goals_delete_own" on savings_goals
  for delete using (auth.uid() = user_id);

create table if not exists savings_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references savings_goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null,
  occurred_at timestamptz not null default now(),
  note text
);

alter table savings_contributions enable row level security;

drop policy if exists "savings_contributions_select" on savings_contributions;
create policy "savings_contributions_select" on savings_contributions
  for select using (
    exists (
      select 1 from savings_goals g
      where g.id = savings_contributions.goal_id
        and (
          g.user_id = auth.uid()
          or (g.household_id is not null and public.is_household_member(g.household_id))
        )
    )
  );
drop policy if exists "savings_contributions_insert" on savings_contributions;
create policy "savings_contributions_insert" on savings_contributions
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from savings_goals g
      where g.id = goal_id
        and (
          g.user_id = auth.uid()
          or (g.household_id is not null and public.is_household_member(g.household_id))
        )
    )
  );
drop policy if exists "savings_contributions_delete_own" on savings_contributions;
create policy "savings_contributions_delete_own" on savings_contributions
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- MIGRACIÓN 5: consumos de tarjeta en dólares --------------------------
alter table card_purchases add column if not exists currency text not null default 'ARS';
alter table card_purchases
  drop constraint if exists card_purchases_currency_check;
alter table card_purchases
  add constraint card_purchases_currency_check check (currency in ('ARS', 'USD'));

alter table card_purchases add column if not exists pay_plan text not null default 'pesos';
alter table card_purchases
  drop constraint if exists card_purchases_pay_plan_check;
alter table card_purchases
  add constraint card_purchases_pay_plan_check check (pay_plan in ('pesos', 'usd'));

-- MIGRACIÓN 4: medio de pago cripto ---------------------------------------
alter table transactions
  drop constraint if exists transactions_payment_method_check;

alter table transactions
  add constraint transactions_payment_method_check
  check (payment_method in ('efectivo', 'debito', 'credito', 'transferencia_qr', 'cripto'));

create table if not exists category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  monthly_limit numeric(14,2) not null check (monthly_limit > 0),
  created_at timestamptz not null default now(),
  unique (user_id, category_id)
);

alter table category_budgets enable row level security;

drop policy if exists "category_budgets_select_own" on category_budgets;
create policy "category_budgets_select_own" on category_budgets
  for select using (auth.uid() = user_id);
drop policy if exists "category_budgets_insert_own" on category_budgets;
create policy "category_budgets_insert_own" on category_budgets
  for insert with check (auth.uid() = user_id);
drop policy if exists "category_budgets_update_own" on category_budgets;
create policy "category_budgets_update_own" on category_budgets
  for update using (auth.uid() = user_id);
drop policy if exists "category_budgets_delete_own" on category_budgets;
create policy "category_budgets_delete_own" on category_budgets
  for delete using (auth.uid() = user_id);

-- GASTOS RECURRENTES (alquiler, sueldo, suscripciones) ----------------------
create table if not exists recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  household_id uuid references households(id) on delete set null,
  account_id uuid not null references accounts(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  kind text not null default 'gasto' check (kind in ('gasto', 'ingreso')),
  amount numeric(14,2) not null check (amount > 0),
  day_of_month smallint not null check (day_of_month between 1 and 31),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table recurring_expenses enable row level security;

drop policy if exists "recurring_select" on recurring_expenses;
create policy "recurring_select" on recurring_expenses
  for select using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );
drop policy if exists "recurring_insert_own" on recurring_expenses;
create policy "recurring_insert_own" on recurring_expenses
  for insert with check (auth.uid() = user_id);
drop policy if exists "recurring_update_own" on recurring_expenses;
create policy "recurring_update_own" on recurring_expenses
  for update using (auth.uid() = user_id);
drop policy if exists "recurring_delete_own" on recurring_expenses;
create policy "recurring_delete_own" on recurring_expenses
  for delete using (auth.uid() = user_id);

-- Registro de qué mes ya se cargó cada recurrente (para no duplicar y poder
-- marcar "ya cargado este mes" con un botón, sin depender de un cron).
create table if not exists recurring_logs (
  id uuid primary key default gen_random_uuid(),
  recurring_id uuid not null references recurring_expenses(id) on delete cascade,
  month date not null,
  transaction_id uuid references transactions(id) on delete set null,
  logged_by uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  unique (recurring_id, month)
);

alter table recurring_logs enable row level security;

drop policy if exists "recurring_logs_select" on recurring_logs;
create policy "recurring_logs_select" on recurring_logs
  for select using (
    exists (
      select 1 from recurring_expenses r
      where r.id = recurring_logs.recurring_id
        and (
          r.user_id = auth.uid()
          or (r.household_id is not null and public.is_household_member(r.household_id))
        )
    )
  );
drop policy if exists "recurring_logs_insert" on recurring_logs;
create policy "recurring_logs_insert" on recurring_logs
  for insert with check (
    auth.uid() = logged_by
    and exists (
      select 1 from recurring_expenses r
      where r.id = recurring_id
        and (
          r.user_id = auth.uid()
          or (r.household_id is not null and public.is_household_member(r.household_id))
        )
    )
  );
drop policy if exists "recurring_logs_delete" on recurring_logs;
create policy "recurring_logs_delete" on recurring_logs
  for delete using (
    exists (
      select 1 from recurring_expenses r
      where r.id = recurring_logs.recurring_id
        and (
          r.user_id = auth.uid()
          or (r.household_id is not null and public.is_household_member(r.household_id))
        )
    )
  );
