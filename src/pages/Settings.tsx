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
import { useDisplayCurrency } from '../context/DisplayCurrencyContext'

export default function Settings() {
  const { rates, source, setSource, updatedAt, loading: ratesLoading, refresh } = useDisplayCurrency()
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
            <div className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white/70">Cotización del dólar</p>
                <button
                  onClick={refresh}
                  disabled={ratesLoading}
                  className="text-xs text-white/40 hover:text-white disabled:opacity-40"
                >
                  {ratesLoading ? 'Actualizando…' : 'Actualizar'}
                </button>
              </div>
              <p className="mt-1 text-xs text-white/40">
                En vivo, vía{' '}
                <a
                  href="https://dolarapi.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-white"
                >
                  dolarapi.com
                </a>
                . Elegí cuál usar para el selector $ → US$ del header.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {(['oficial', 'cripto'] as const).map((s) => {
                  const r = rates[s]
                  return (
                    <button
                      key={s}
                      onClick={() => setSource(s)}
                      className={`rounded-xl border p-3 text-left transition ${
                        source === s
                          ? 'border-brand bg-brand/10'
                          : 'border-bg-border bg-bg hover:border-white/20'
                      }`}
                    >
                      <p className="text-xs font-bold uppercase text-white/60">
                        Dólar {s}
                      </p>
                      {r ? (
                        <>
                          <p className="mt-1 font-mono text-lg font-bold text-white">
                            ${r.venta.toLocaleString('es-AR')}
                          </p>
                          <p className="text-[10px] text-white/30">
                            Compra ${r.compra.toLocaleString('es-AR')}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-xs text-white/30">
                          {ratesLoading ? 'Cargando…' : 'No disponible'}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
              {updatedAt && (
                <p className="mt-3 text-[10px] text-white/30">
                  Actualizado: {new Date(updatedAt).toLocaleString('es-AR')}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </AppShell>
  )
}
