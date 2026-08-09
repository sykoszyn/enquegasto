import { useState } from 'react'
import type { FormEvent } from 'react'
import { Repeat, Check } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { hapticSuccess } from '../lib/haptics'
import type { Account, Category, Kind, RecurringExpense, RecurringLog } from '../types'
import Amount from './Amount'
import { monthKey, monthStart } from '../lib/cardMath'

interface Props {
  recurring: RecurringExpense[]
  logs: RecurringLog[]
  accounts: Account[]
  categories: Category[]
  onChange: () => void
}

export default function RecurringManager({ recurring, logs, accounts, categories, onChange }: Props) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [kind, setKind] = useState<Kind>('gasto')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [categoryId, setCategoryId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const thisMonth = monthStart(new Date())
  const key = monthKey(thisMonth)

  const filteredCategories = categories.filter((c) => c.kind === kind)

  const add = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = Number(amount.replace(/\./g, '').replace(',', '.'))
    if (!name.trim() || !parsed || parsed <= 0 || !accountId) {
      setError('Completá nombre, importe y cuenta.')
      return
    }
    setSaving(true)
    setError(null)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase.from('recurring_expenses').insert({
      user_id: user?.id,
      account_id: accountId,
      category_id: categoryId || null,
      name: name.trim(),
      kind,
      amount: parsed,
      day_of_month: Number(dayOfMonth) || 1,
    })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setName('')
    setAmount('')
    onChange()
  }

  const remove = async (id: string) => {
    if (!confirm('¿Borrar este gasto recurrente?')) return
    await supabase.from('recurring_expenses').delete().eq('id', id)
    onChange()
  }

  const logThisMonth = async (r: RecurringExpense) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user?.id,
        account_id: r.account_id,
        category_id: r.category_id,
        kind: r.kind,
        amount: r.amount,
        description: r.name,
        payment_method: 'transferencia_qr',
        occurred_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (txError) {
      alert(txError.message)
      return
    }

    await supabase.from('recurring_logs').insert({
      recurring_id: r.id,
      month: key,
      transaction_id: tx?.id,
      logged_by: user?.id,
    })
    hapticSuccess()
    onChange()
  }

  const unlog = async (r: RecurringExpense) => {
    const log = logs.find((l) => l.recurring_id === r.id && l.month.slice(0, 10) === key)
    if (!log) return
    if (log.transaction_id) {
      await supabase.from('transactions').delete().eq('id', log.transaction_id)
    }
    await supabase.from('recurring_logs').delete().eq('id', log.id)
    onChange()
  }

  return (
    <div className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
      <p className="flex items-center gap-2 text-sm font-semibold text-white/70">
        <Repeat className="h-4 w-4 text-violet" /> Gastos recurrentes
      </p>

      {recurring.length > 0 && (
        <ul className="mt-4 space-y-2">
          {recurring.map((r) => {
            const logged = logs.some((l) => l.recurring_id === r.id && l.month.slice(0, 10) === key)
            return (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl bg-bg px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white/85">{r.name}</p>
                  <p className="text-[11px] text-white/40">
                    Día {r.day_of_month} ·{' '}
                    <Amount value={r.amount} currency={accounts.find((a) => a.id === r.account_id)?.currency ?? 'ARS'} />
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => (logged ? unlog(r) : logThisMonth(r))}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                      logged ? 'bg-brand/15 text-brand' : 'bg-bg-raised text-white/50 hover:text-white'
                    }`}
                  >
                    <Check className="h-3 w-3" />
                    {logged ? 'Cargado' : 'Cargar este mes'}
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="text-xs text-white/30 hover:text-gasto"
                  >
                    ✕
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <form onSubmit={add} className="mt-5 space-y-2 border-t border-bg-border pt-4">
        <div className="flex gap-2 rounded-xl bg-bg p-1">
          <button
            type="button"
            onClick={() => {
              setKind('gasto')
              setCategoryId('')
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
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
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
              kind === 'ingreso' ? 'bg-brand text-bg' : 'text-white/40'
            }`}
          >
            Ingreso
          </button>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Netflix, Alquiler"
          className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Importe"
            className="rounded-xl border border-bg-border bg-bg px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-brand"
          />
          <input
            inputMode="numeric"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value.replace(/\D/g, ''))}
            placeholder="Día del mes"
            className="rounded-xl border border-bg-border bg-bg px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-brand"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-xl border border-bg-border bg-bg px-2 py-2.5 text-sm text-white outline-none focus:border-brand"
          >
            <option value="">Sin categoría</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="rounded-xl border border-bg-border bg-bg px-2 py-2.5 text-sm text-white outline-none focus:border-brand"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-gasto">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-bg-raised py-2 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          {saving ? 'Agregando…' : '+ Agregar recurrente'}
        </button>
      </form>
    </div>
  )
}
