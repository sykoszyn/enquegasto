import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Account, Category, Kind, PaymentMethod, Transaction } from '../types'
import { PAYMENT_METHOD_LABELS } from '../types'

const PAYMENT_METHODS: PaymentMethod[] = ['transferencia_qr', 'efectivo', 'debito', 'credito']

interface Props {
  transaction: Transaction
  accounts: Account[]
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export default function EditTransactionModal({
  transaction,
  accounts,
  categories,
  onClose,
  onSaved,
}: Props) {
  const [kind, setKind] = useState<Kind>(transaction.kind)
  const [amount, setAmount] = useState(String(transaction.amount))
  const [categoryId, setCategoryId] = useState(transaction.category_id ?? '')
  const [accountId, setAccountId] = useState(transaction.account_id)
  const [description, setDescription] = useState(transaction.description ?? '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    transaction.payment_method ?? 'transferencia_qr'
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredCategories = categories.filter((c) => c.kind === kind)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const parsed = Number(amount.replace(/\./g, '').replace(',', '.'))
    if (!parsed || parsed <= 0) {
      setError('Ingresá un importe válido.')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('transactions')
      .update({
        kind,
        amount: parsed,
        category_id: categoryId || null,
        account_id: accountId,
        description: description || null,
        payment_method: paymentMethod,
      })
      .eq('id', transaction.id)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    onSaved()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-pop"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Editar movimiento</p>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="flex gap-2 rounded-xl bg-bg p-1">
            <button
              type="button"
              onClick={() => {
                setKind('gasto')
                setCategoryId('')
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
                kind === 'gasto' ? 'bg-gasto text-white' : 'text-white/40'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => {
                setKind('ingreso')
                setCategoryId('')
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
                kind === 'ingreso' ? 'bg-brand text-bg' : 'text-white/40'
              }`}
            >
              Ingreso
            </button>
          </div>

          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-bg-border bg-bg px-4 py-3 font-mono text-lg font-bold text-white outline-none focus:border-brand"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40">Categoría</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-bg-border bg-bg px-2 py-2.5 text-sm text-white outline-none focus:border-brand"
              >
                <option value="">Sin categoría</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40">Cuenta</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-bg-border bg-bg px-2 py-2.5 text-sm text-white outline-none focus:border-brand"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40">Medio de pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="mt-1 w-full rounded-xl border border-bg-border bg-bg px-2 py-2.5 text-sm text-white outline-none focus:border-brand"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </div>

          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción"
            className="w-full rounded-xl border border-bg-border bg-bg px-4 py-2.5 text-sm text-white outline-none focus:border-brand"
          />

          {error && <p className="text-sm text-gasto">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-bg py-2.5 text-sm font-semibold text-white/60 transition hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-bold text-bg shadow-glow transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
