import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type {
  Account,
  Category,
  CategoryBudget,
  Household,
  RecurringExpense,
  RecurringLog,
  Transaction,
} from '../types'
import AppShell from '../components/AppShell'
import CategoryManager from '../components/CategoryManager'
import AccountManager from '../components/AccountManager'
import HouseholdManager from '../components/HouseholdManager'
import BudgetManager from '../components/BudgetManager'
import RecurringManager from '../components/RecurringManager'
import DonateButton from '../components/DonateButton'

export default function Settings() {
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [households, setHouseholds] = useState<Household[]>([])
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [recurring, setRecurring] = useState<RecurringExpense[]>([])
  const [recurringLogs, setRecurringLogs] = useState<RecurringLog[]>([])
  const [monthTx, setMonthTx] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const now = new Date()
    const monthStartIso = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [{ data: cat }, { data: acc }, { data: hs }, { data: bud }, { data: rec }, { data: logs }, { data: tx }] =
      await Promise.all([
        supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
        supabase.from('accounts').select('*').order('created_at'),
        supabase.from('households').select('*').order('created_at'),
        supabase.from('category_budgets').select('*, category:categories(*)').eq('user_id', user.id),
        supabase.from('recurring_expenses').select('*').order('created_at'),
        supabase.from('recurring_logs').select('*'),
        supabase
          .from('transactions')
          .select('*, category:categories(*)')
          .gte('occurred_at', monthStartIso),
      ])
    setCategories(cat ?? [])
    setAccounts(acc ?? [])
    setHouseholds(hs ?? [])
    setBudgets((bud as unknown as CategoryBudget[]) ?? [])
    setRecurring(rec ?? [])
    setRecurringLogs(logs ?? [])
    setMonthTx((tx as unknown as Transaction[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Ajustes</h1>
            <p className="mt-1 text-sm text-white/40">
              Categorías, cuentas, presupuestos y con quién compartís tus gastos.
            </p>
          </div>
          <DonateButton />
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-white/40">Cargando…</p>
        ) : (
          <div className="mt-6 space-y-6">
            <HouseholdManager />
            <div className="grid gap-6 md:grid-cols-2">
              <CategoryManager categories={categories} onChange={load} />
              <AccountManager accounts={accounts} households={households} onChange={load} />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <BudgetManager
                budgets={budgets}
                categories={categories}
                monthTx={monthTx}
                currency={accounts[0]?.currency ?? 'ARS'}
                onChange={load}
              />
              <RecurringManager
                recurring={recurring}
                logs={recurringLogs}
                accounts={accounts}
                categories={categories}
                onChange={load}
              />
            </div>
          </div>
        )}
      </main>
    </AppShell>
  )
}
