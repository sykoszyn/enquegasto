
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
