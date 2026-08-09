import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Card, Category } from '../types'

interface Props {
  cards: Card[]
  categories: Category[]
  onCreated: () => void
}

export default function CardPurchaseForm({ cards, categories, onCreated }: Props) {
  const [cardId, setCardId] = useState(cards[0]?.id ?? '')
  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [installments, setInstallments] = useState('1')
  const [categoryId, setCategoryId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gastoCategories = categories.filter((c) => c.kind === 'gasto')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const parsedAmount = Number(totalAmount.replace(/\./g, '').replace(',', '.'))
    const parsedInstallments = Number(installments)
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Ingresá un importe válido.')
      return
    }
    if (!cardId) {
      setError('Elegí una tarjeta.')
      return
    }
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const now = new Date()
    const { error } = await supabase.from('card_purchases').insert({
      card_id: cardId,
      user_id: user?.id,
      category_id: categoryId || null,
      description: description || 'Compra',
      total_amount: parsedAmount,
      installments: parsedInstallments,
      first_installment_date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setDescription('')
    setTotalAmount('')
    setInstallments('1')
    onCreated()
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-bg-border p-6 text-center text-sm text-white/40">
        Agregá una tarjeta primero para poder cargar compras.
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
      <p className="text-sm font-semibold text-white/70">Nueva compra</p>
      <div className="mt-3 space-y-3">
        <select
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
          className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
        >
          {cards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (ej. Zapatillas)"
          className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/40">Importe total</label>
            <input
              inputMode="decimal"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0,00"
              className="mt-1 w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 font-mono text-white outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-xs text-white/40">Cuotas</label>
            <input
              inputMode="numeric"
              value={installments}
              onChange={(e) => setInstallments(e.target.value.replace(/\D/g, '') || '1')}
              className="mt-1 w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 font-mono text-white outline-none focus:border-brand"
            />
          </div>
        </div>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-xl border border-bg-border bg-bg px-2 py-2.5 text-sm text-white outline-none focus:border-brand"
        >
          <option value="">Sin categoría</option>
          {gastoCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {totalAmount && Number(installments) > 1 && (
          <p className="text-[11px] text-white/40">
            ≈{' '}
            {(
              Number(totalAmount.replace(/\./g, '').replace(',', '.')) / Number(installments)
            ).toLocaleString('es-AR', { maximumFractionDigits: 0 })}{' '}
            por mes, durante {installments} meses
          </p>
        )}
        {error && <p className="text-sm text-gasto">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-bg shadow-glow transition hover:brightness-110 disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Cargar compra'}
        </button>
      </div>
    </form>
  )
}
