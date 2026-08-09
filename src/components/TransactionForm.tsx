import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { hapticSuccess } from '../lib/haptics'
import type { Account, Category, Kind, PaymentMethod } from '../types'
import { PAYMENT_METHOD_LABELS } from '../types'

interface Props {
  accounts: Account[]
  categories: Category[]
  onCreated: () => void
}

const PAYMENT_METHODS: PaymentMethod[] = ['transferencia_qr', 'efectivo', 'debito', 'credito', 'cripto']

export default function TransactionForm({ accounts, categories, onCreated }: Props) {
  const [kind, setKind] = useState<Kind>('gasto')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia_qr')
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
    if (!accountId) {
      setError('Elegí una cuenta.')
      return
    }
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('transactions').insert({
      user_id: user?.id,
      account_id: accountId,
      category_id: categoryId || null,
      kind,
      amount: parsed,
      description: description || null,
      payment_method: paymentMethod,
      occurred_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setAmount('')
    setDescription('')
    setPaymentMethod('transferencia_qr')
    hapticSuccess()
    onCreated()
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
      <div className="flex gap-2 rounded-xl bg-bg p-1">
        <button
          type="button"
          onClick={() => {
            setKind('gasto')
            setCategoryId('')
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
            kind === 'gasto' ? 'bg-gasto text-white' : 'text-white/40 hover:text-white'
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
            kind === 'ingreso' ? 'bg-brand text-bg' : 'text-white/40 hover:text-white'
          }`}
        >
          Ingreso
        </button>
      </div>

      <div className="mt-4">
        <input
          inputMode="decimal"
          placeholder="$ 0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-bg-border bg-bg px-4 py-3 font-mono text-2xl font-bold text-white outline-none placeholder:text-white/20 focus:border-brand"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/40">Categoría</label>
            <Link to="/app/configuracion" className="text-[11px] text-brand hover:underline">
              + nueva
            </Link>
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
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
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/40">Cuenta</label>
            <Link to="/app/configuracion" className="text-[11px] text-brand hover:underline">
              + nueva
            </Link>
          </div>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.currency}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label className="text-xs text-white/40">Medio de pago</label>
        <div className="mt-1.5 grid grid-cols-5 gap-1.5">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPaymentMethod(m)}
              className={`rounded-lg py-2 text-[11px] font-semibold transition ${
                paymentMethod === m
                  ? 'bg-ambar text-bg'
                  : 'bg-bg text-white/40 hover:text-white'
              }`}
              title={PAYMENT_METHOD_LABELS[m]}
            >
              {m === 'transferencia_qr'
                ? 'QR'
                : m === 'efectivo'
                ? 'Efvo.'
                : m === 'debito'
                ? 'Déb.'
                : m === 'credito'
                ? 'Créd.'
                : 'Cripto'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          className="w-full rounded-xl border border-bg-border bg-bg px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand"
        />
      </div>

      {error && <p className="mt-3 text-sm text-gasto">{error}</p>}

      <button
        type="submit"
        disabled={saving || accounts.length === 0}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-bg shadow-glow transition hover:brightness-110 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" /> {saving ? 'Guardando…' : 'Anotar'}
      </button>
      {accounts.length === 0 && (
        <p className="mt-2 text-xs text-white/40">
          Creá una cuenta primero para poder anotar movimientos.
        </p>
      )}
    </form>
  )
}
