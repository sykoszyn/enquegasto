import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Download, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import type { Account, Card, CardPayment, CardPurchase, Category, Transaction } from '../types'
import AppShell from '../components/AppShell'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import CategoryChart from '../components/CategoryChart'
import MonthCompareChart from '../components/MonthCompareChart'
import EditTransactionModal from '../components/EditTransactionModal'
import AiChat from '../components/AiChat'
import Amount from '../components/Amount'
import { useDisplayCurrency } from '../context/DisplayCurrencyContext'
import { downloadTransactionsCsv } from '../lib/csv'
import { cardDueForMonth, monthKey, monthStart } from '../lib/cardMath'
import { getCached, setCached } from '../lib/cache'

interface DashboardCache {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  cards: Card[]
  cardPurchases: CardPurchase[]
  cardPayments: CardPayment[]
}

const cached = getCached<DashboardCache>('dashboard')

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'user_id' | 'household_id'>[] = [
  { name: 'Comida', kind: 'gasto', color: '#FB5A6B', icon: '🛒' },
  { name: 'Transporte', kind: 'gasto', color: '#F5A623', icon: '🚗' },
  { name: 'Casa', kind: 'gasto', color: '#8B7CF6', icon: '🏠' },
  { name: 'Salidas', kind: 'gasto', color: '#FB5A6B', icon: '🎉' },
  { name: 'Salud', kind: 'gasto', color: '#F5A623', icon: '💊' },
  { name: 'Sueldo', kind: 'ingreso', color: '#3DDC97', icon: '💰' },
  { name: 'Otros ingresos', kind: 'ingreso', color: '#3DDC97', icon: '💵' },
]


export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>(cached?.accounts ?? [])
  const [categories, setCategories] = useState<Category[]>(cached?.categories ?? [])
  const [transactions, setTransactions] = useState<Transaction[]>(cached?.transactions ?? [])
  const [cards, setCards] = useState<Card[]>(cached?.cards ?? [])
  const [cardPurchases, setCardPurchases] = useState<CardPurchase[]>(cached?.cardPurchases ?? [])
  const [cardPayments, setCardPayments] = useState<CardPayment[]>(cached?.cardPayments ?? [])
  const [loading, setLoading] = useState(!cached)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const ensureDefaults = useCallback(async (userId: string) => {
    const { data: existingAccounts } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)

    if (!existingAccounts || existingAccounts.length === 0) {
      await supabase
        .from('accounts')
        .insert({ user_id: userId, name: 'Efectivo', currency: 'ARS' })
    }

    const { data: existingCategories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)

    if (!existingCategories || existingCategories.length === 0) {
      await supabase
        .from('categories')
        .insert(DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: userId })))
    }
  }, [])

  const loadAll = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await ensureDefaults(user.id)

    const [{ data: acc }, { data: cat }, { data: tx }, { data: c }, { data: cp }, { data: pay }] =
      await Promise.all([
        supabase.from('accounts').select('*').order('created_at'),
        supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
        supabase
          .from('transactions')
          .select('*, category:categories(*), account:accounts(*)')
          .order('occurred_at', { ascending: false }),
        supabase.from('cards').select('*'),
        supabase.from('card_purchases').select('*'),
        supabase.from('card_payments').select('*'),
      ])

    setAccounts(acc ?? [])
    setCategories(cat ?? [])
    setTransactions((tx as unknown as Transaction[]) ?? [])
    setCards(c ?? [])
    setCardPurchases((cp as unknown as CardPurchase[]) ?? [])
    setCardPayments(pay ?? [])
    setLoading(false)

    setCached('dashboard', {
      accounts: acc ?? [],
      categories: cat ?? [],
      transactions: (tx as unknown as Transaction[]) ?? [],
      cards: c ?? [],
      cardPurchases: (cp as unknown as CardPurchase[]) ?? [],
      cardPayments: pay ?? [],
    })
  }, [ensureDefaults])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const onDelete = async (id: string) => {
    if (!confirm('¿Borrar este movimiento?')) return
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    await supabase.from('transactions').delete().eq('id', id)
  }

  const primaryCurrency = accounts[0]?.currency ?? 'ARS'
  const { mode: currencyMode, rate: usdRate, source: dolarSource } = useDisplayCurrency()
  const showUsd = currencyMode === 'usd' && usdRate && primaryCurrency === 'ARS'
  const heroCurrency = showUsd ? 'USD' : primaryCurrency
  const conv = (n: number) => (showUsd ? n / (usdRate as number) : n)
  const thisMonth = monthStart(new Date())

  const filteredTransactions = useMemo(() => {
    if (!dateFrom && !dateTo) return transactions
    return transactions.filter((t) => {
      const d = t.occurred_at.slice(0, 10)
      if (dateFrom && d < dateFrom) return false
      if (dateTo && d > dateTo) return false
      return true
    })
  }, [transactions, dateFrom, dateTo])

  const daysSinceLastActivity = useMemo(() => {
    if (transactions.length === 0) return null
    const last = transactions.reduce(
      (max, t) => (t.occurred_at > max ? t.occurred_at : max),
      transactions[0].occurred_at
    )
    const diffMs = Date.now() - new Date(last).getTime()
    return Math.floor(diffMs / (1000 * 60 * 60 * 24))
  }, [transactions])

  const home = useMemo(() => {
    const now = new Date()
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const inMonth = (t: Transaction, d: Date) => {
      const td = new Date(t.occurred_at)
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
    }

    const monthTxPrimary = transactions.filter(
      (t) => inMonth(t, now) && (t.account?.currency ?? primaryCurrency) === primaryCurrency
    )
    const prevMonthTxPrimary = transactions.filter(
      (t) => inMonth(t, prevDate) && (t.account?.currency ?? primaryCurrency) === primaryCurrency
    )

    const pagado = monthTxPrimary.filter((t) => t.kind === 'gasto').reduce((s, t) => s + t.amount, 0)
    const ingresos = monthTxPrimary.filter((t) => t.kind === 'ingreso').reduce((s, t) => s + t.amount, 0)
    const prevGasto = prevMonthTxPrimary.filter((t) => t.kind === 'gasto').reduce((s, t) => s + t.amount, 0)
    const prevIngreso = prevMonthTxPrimary.filter((t) => t.kind === 'ingreso').reduce((s, t) => s + t.amount, 0)
    const change = prevGasto > 0 ? ((pagado - prevGasto) / prevGasto) * 100 : null

    const key = monthKey(thisMonth)
    const cardsInPrimaryCurrency = cards.filter((c) => c.currency === primaryCurrency)
    const pendiente = cardsInPrimaryCurrency
      .filter((c) => !cardPayments.some((p) => p.card_id === c.id && p.month.slice(0, 10) === key))
      .reduce((sum, c) => {
        const purchasesForCard = cardPurchases.filter((p) => p.card_id === c.id)
        return sum + cardDueForMonth(purchasesForCard, thisMonth)
      }, 0)

    const teQueda = ingresos - pagado - pendiente

    const daysSoFar = now.getDate()
    const promedioDiario = daysSoFar > 0 ? pagado / daysSoFar : 0

    const byCategory = new Map<string, number>()
    for (const t of monthTxPrimary) {
      if (t.kind !== 'gasto') continue
      const catKey = t.category?.name ?? 'Sin categoría'
      byCategory.set(catKey, (byCategory.get(catKey) ?? 0) + t.amount)
    }
    let categoriaTop: string | null = null
    let categoriaTopMonto = 0
    for (const [catName, amt] of byCategory) {
      if (amt > categoriaTopMonto) {
        categoriaTop = catName
        categoriaTopMonto = amt
      }
    }

    const otherCurrencies = Array.from(
      new Set(
        transactions
          .filter((t) => inMonth(t, now) && (t.account?.currency ?? primaryCurrency) !== primaryCurrency)
          .map((t) => t.account?.currency)
      )
    ).filter(Boolean) as string[]

    return {
      pagado,
      ingresos,
      pendiente,
      teQueda,
      change,
      promedioDiario,
      categoriaTop,
      categoriaTopMonto,
      prevGasto,
      prevIngreso,
      monthTx: monthTxPrimary,
      otherCurrencies,
    }
  }, [transactions, cards, cardPurchases, cardPayments, primaryCurrency, thisMonth])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-white/40 text-sm">
        Cargando…
      </div>
    )
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-6 py-8">
        {daysSinceLastActivity !== null && daysSinceLastActivity >= 2 && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-ambar/20 bg-ambar/10 px-4 py-3 text-sm text-ambar">
            <span>⏰</span>
            <span>
              Hace {daysSinceLastActivity} días que no anotás nada. ¿Te olvidaste de algo?
            </span>
          </div>
        )}
        {/* Hero: balance del mes */}
        <div className="relative overflow-hidden rounded-3xl border border-bg-border bg-gradient-to-br from-bg-surface to-bg-raised p-6 shadow-card sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full glow-brand blur-3xl"
          />
          <p className="text-sm text-white/50">
            {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </p>
          <p className="tabular mt-1 font-mono text-4xl font-bold text-white sm:text-5xl">
            <Amount value={conv(home.teQueda)} currency={heroCurrency} />
          </p>
          <p className="mt-1 text-sm text-white/40">
            te queda este mes
            {showUsd && (
              <span className="ml-1 text-white/25">
                · dólar {dolarSource} (${usdRate?.toLocaleString('es-AR')})
              </span>
            )}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-bg/40 p-4">
              <p className="flex items-center gap-1 text-[11px] text-gasto">
                <ArrowDownRight className="h-3.5 w-3.5" /> Pagado
              </p>
              <p className="tabular mt-1 font-mono text-base font-bold text-white sm:text-lg">
                <Amount value={conv(home.pagado)} currency={heroCurrency} />
              </p>
              {home.change !== null && (
                <p
                  className={`mt-0.5 flex items-center gap-0.5 text-[10px] ${
                    home.change > 0 ? 'text-gasto' : 'text-brand'
                  }`}
                >
                  {home.change > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(home.change).toFixed(0)}%
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-bg/40 p-4">
              <p className="flex items-center gap-1 text-[11px] text-brand">
                <ArrowUpRight className="h-3.5 w-3.5" /> Ingresos
              </p>
              <p className="tabular mt-1 font-mono text-base font-bold text-white sm:text-lg">
                <Amount value={conv(home.ingresos)} currency={heroCurrency} />
              </p>
            </div>
            <div className="rounded-2xl bg-bg/40 p-4">
              <p className="flex items-center gap-1 text-[11px] text-ambar">
                <Wallet className="h-3.5 w-3.5" /> Por pagar
              </p>
              <p className="tabular mt-1 font-mono text-base font-bold text-white sm:text-lg">
                <Amount value={conv(home.pendiente)} currency={heroCurrency} />
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-bg/40 p-4">
              <p className="text-[11px] text-white/40">Promedio diario</p>
              <p className="tabular mt-1 font-mono text-sm font-bold text-white">
                <Amount value={conv(home.promedioDiario)} currency={heroCurrency} />
              </p>
            </div>
            <div className="rounded-2xl bg-bg/40 p-4">
              <p className="text-[11px] text-white/40">Categoría top</p>
              <p className="mt-1 truncate text-sm font-bold text-white">
                {home.categoriaTop ?? '—'}
              </p>
            </div>
          </div>

          {home.otherCurrencies.length > 0 && (
            <p className="mt-4 text-[11px] text-white/30">
              También tenés movimientos en {home.otherCurrencies.join(', ')} — mirá el
              detalle más abajo.
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => downloadTransactionsCsv(transactions, primaryCurrency)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-white/40 transition hover:text-white"
          >
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            <TransactionForm
              accounts={accounts}
              categories={categories}
              onCreated={loadAll}
            />
            <CategoryChart transactions={home.monthTx} currency={primaryCurrency} />
            <MonthCompareChart
              currentGasto={home.pagado}
              previousGasto={home.prevGasto}
              currentIngreso={home.ingresos}
              previousIngreso={home.prevIngreso}
              currency={primaryCurrency}
            />
          </div>
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-bg-border bg-bg-surface p-3">
              <span className="text-xs text-white/40">Ver del</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-bg-border bg-bg px-2 py-1.5 text-xs text-white outline-none focus:border-brand"
              />
              <span className="text-xs text-white/40">al</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-bg-border bg-bg px-2 py-1.5 text-xs text-white outline-none focus:border-brand"
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setDateFrom('')
                    setDateTo('')
                  }}
                  className="ml-auto text-xs text-white/40 hover:text-gasto"
                >
                  Limpiar
                </button>
              )}
            </div>
            <TransactionList
              transactions={filteredTransactions}
              currency={primaryCurrency}
              onDelete={onDelete}
              onEdit={setEditing}
            />
          </div>
        </div>
      </main>

      {editing && (
        <EditTransactionModal
          transaction={editing}
          accounts={accounts}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            loadAll()
          }}
        />
      )}

      <AiChat
        accounts={accounts}
        context={{
          pagado_este_mes: home.pagado,
          ingresos_este_mes: home.ingresos,
          pendiente_tarjetas: home.pendiente,
          te_queda: home.teQueda,
          moneda: primaryCurrency,
        }}
        onTransactionAdded={loadAll}
      />
    </AppShell>
  )
}
