
-- ============================================================================
-- MIGRACIÓN 3: Presupuestos por categoría, gastos recurrentes
-- ============================================================================

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
