import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { CreditCard, Check, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import type { Card, CardPayment, CardPurchase, Category, Household } from '../types'
import AppShell from '../components/AppShell'
import {
  cardDueForMonth,
  installmentAmount,
  installmentNumberInMonth,
  isPurchaseActiveInMonth,
  monthKey,
  monthStart,
} from '../lib/cardMath'
import CardPurchaseForm from '../components/CardPurchaseForm'

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n)

function NewCardForm({
  households,
  onCreated,
}: {
  households: Household[]
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [closingDay, setClosingDay] = useState('10')
  const [dueDay, setDueDay] = useState('20')
  const [householdId, setHouseholdId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase.from('cards').insert({
      user_id: user?.id,
      name: name.trim(),
      closing_day: Number(closingDay) || 10,
      due_day: Number(dueDay) || 20,
      household_id: householdId || null,
    })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setName('')
    onCreated()
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
      <p className="text-sm font-semibold text-white/70">Nueva tarjeta</p>
      <div className="mt-3 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Visa Galicia"
          className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/40">Día de cierre</label>
            <input
              inputMode="numeric"
              value={closingDay}
              onChange={(e) => setClosingDay(e.target.value.replace(/\D/g, ''))}
              className="mt-1 w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 font-mono text-white outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-xs text-white/40">Día de vencimiento</label>
            <input
              inputMode="numeric"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value.replace(/\D/g, ''))}
              className="mt-1 w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 font-mono text-white outline-none focus:border-brand"
            />
          </div>
        </div>
        {households.length > 0 && (
          <select
            value={householdId}
            onChange={(e) => setHouseholdId(e.target.value)}
            className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
          >
            <option value="">Personal (solo yo)</option>
            {households.map((h) => (
              <option key={h.id} value={h.id}>
                Compartida con {h.name}
              </option>
            ))}
          </select>
        )}
        {error && <p className="text-sm text-gasto">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-bg-raised py-2 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          {saving ? 'Agregando…' : '+ Agregar tarjeta'}
        </button>
      </div>
    </form>
  )
}

export default function Cards() {
  const [cards, setCards] = useState<Card[]>([])
  const [purchases, setPurchases] = useState<CardPurchase[]>([])
  const [payments, setPayments] = useState<CardPayment[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: c }, { data: p }, { data: pay }, { data: cat }, { data: hs }] =
      await Promise.all([
        supabase.from('cards').select('*').order('created_at'),
        supabase
          .from('card_purchases')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false }),
        supabase.from('card_payments').select('*'),
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase.from('households').select('*'),
      ])
    setCards(c ?? [])
    setPurchases((p as unknown as CardPurchase[]) ?? [])
    setPayments(pay ?? [])
    setCategories(cat ?? [])
    setHouseholds(hs ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const thisMonth = monthStart(new Date())

  const togglePaid = async (cardId: string) => {
    const key = monthKey(thisMonth)
    const existing = payments.find((p) => p.card_id === cardId && p.month.slice(0, 10) === key)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (existing) {
      await supabase.from('card_payments').delete().eq('id', existing.id)
    } else {
      await supabase
        .from('card_payments')
        .insert({ card_id: cardId, month: key, paid_by: user?.id })
    }
    load()
  }

  const removeCard = async (card: Card) => {
    const purchaseCount = purchases.filter((p) => p.card_id === card.id).length
    const msg =
      purchaseCount > 0
        ? `Esta tarjeta tiene ${purchaseCount} compra(s) cargada(s). Si la borrás, se borran también esas compras y sus cuotas. ¿Confirmás?`
        : '¿Borrar esta tarjeta?'
    if (!confirm(msg)) return
    const { error } = await supabase.from('cards').delete().eq('id', card.id)
    if (error) {
      alert(error.message)
      return
    }
    load()
  }

  const summary = useMemo(() => {
    return cards.map((card) => {
      const cardPurchases = purchases.filter((p) => p.card_id === card.id)
      const due = cardDueForMonth(cardPurchases, thisMonth)
      const key = monthKey(thisMonth)
      const paid = payments.some((p) => p.card_id === card.id && p.month.slice(0, 10) === key)
      const activePurchases = cardPurchases.filter((p) => isPurchaseActiveInMonth(p, thisMonth))
      return { card, due, paid, activePurchases }
    })
  }, [cards, purchases, payments, thisMonth])

  const totalDue = summary.filter((s) => !s.paid).reduce((sum, s) => sum + s.due, 0)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-white/40 text-sm">
        Cargando tarjetas…
      </div>
    )
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <CreditCard className="h-5 w-5 text-ambar" /> Tarjetas
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Cargá una compra en cuotas una sola vez, y la app te va mostrando
          cuánto vencé cada mes.
        </p>

        <div className="mt-5 overflow-hidden rounded-2xl border border-bg-border bg-gradient-to-br from-bg-surface to-bg-raised p-5 shadow-card">
          <p className="text-sm text-white/50">Te queda por pagar este mes</p>
          <p className="tabular mt-1 font-mono text-3xl font-bold text-gasto">
            {fmt(totalDue, cards[0]?.currency ?? 'ARS')}
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="space-y-6">
            <NewCardForm households={households} onCreated={load} />
            <CardPurchaseForm cards={cards} categories={categories} onCreated={load} />
          </div>

          <div className="space-y-4">
            {summary.length === 0 && (
              <div className="rounded-2xl border border-dashed border-bg-border p-10 text-center text-sm text-white/40">
                Todavía no agregaste ninguna tarjeta.
              </div>
            )}
            {summary.map(({ card, due, paid, activePurchases }) => (
              <div
                key={card.id}
                className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">
                      {card.name}
                      {card.household_id && (
                        <span className="ml-2 rounded-md bg-ambar/15 px-1.5 py-0.5 text-[9px] font-semibold text-ambar">
                          COMPARTIDA
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-white/40">
                      Cierra el {card.closing_day} · vence el {card.due_day}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePaid(card.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        paid ? 'bg-brand/15 text-brand' : 'bg-bg text-white/50 hover:text-white'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {paid ? 'Pagado' : 'Marcar pagado'}
                    </button>
                    <button
                      onClick={() => removeCard(card)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-bg text-white/30 transition hover:text-gasto"
                      aria-label="Borrar tarjeta"
                      title="Borrar tarjeta"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="tabular mt-3 font-mono text-xl font-bold text-gasto">
                  {fmt(due, card.currency)}
                </p>

                {activePurchases.length > 0 && (
                  <ul className="mt-3 space-y-1.5 border-t border-bg-border pt-3">
                    {activePurchases.map((p) => {
                      const n = installmentNumberInMonth(p, thisMonth)
                      return (
                        <li
                          key={p.id}
                          className="flex items-center justify-between text-xs text-white/60"
                        >
                          <span className="truncate">
                            {p.description}{' '}
                            <span className="text-white/30">
                              ({n}/{p.installments})
                            </span>
                          </span>
                          <span className="tabular font-mono">
                            {fmt(installmentAmount(p), card.currency)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  )
}
