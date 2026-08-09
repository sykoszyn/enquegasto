import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Category, CategoryBudget, Transaction } from '../types'
import Amount from './Amount'

interface Props {
  budgets: CategoryBudget[]
  categories: Category[]
  monthTx: Transaction[]
  currency: string
  onChange: () => void
}

function barColor(pct: number) {
  if (pct < 70) return 'bg-brand'
  if (pct < 100) return 'bg-ambar'
  return 'bg-gasto'
}

export default function BudgetManager({ budgets, categories, monthTx, currency, onChange }: Props) {
  const [categoryId, setCategoryId] = useState('')
  const [limit, setLimit] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gastoCategories = categories.filter((c) => c.kind === 'gasto')
  const availableCategories = gastoCategories.filter(
    (c) => !budgets.some((b) => b.category_id === c.id)
  )

  const spentByCategory = (categoryId: string) =>
    monthTx
      .filter((t) => t.kind === 'gasto' && t.category_id === categoryId)
      .reduce((s, t) => s + t.amount, 0)

  const add = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = Number(limit.replace(/\./g, '').replace(',', '.'))
    if (!categoryId || !parsed || parsed <= 0) {
      setError('Elegí una categoría y un límite válido.')
      return
    }
    setSaving(true)
    setError(null)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('category_budgets')
      .insert({ user_id: user?.id, category_id: categoryId, monthly_limit: parsed })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setCategoryId('')
    setLimit('')
    onChange()
  }

  const remove = async (id: string) => {
    await supabase.from('category_budgets').delete().eq('id', id)
    onChange()
  }

  return (
    <div className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
      <p className="text-sm font-semibold text-white/70">Presupuestos por categoría</p>

      {budgets.length > 0 && (
        <div className="mt-4 space-y-4">
          {budgets.map((b) => {
            const spent = spentByCategory(b.category_id)
            const pct = Math.min(100, (spent / b.monthly_limit) * 100)
            return (
              <div key={b.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-white/80">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: b.category?.color ?? '#8B93A7' }}
                    />
                    {b.category?.name}
                  </span>
                  <button
                    onClick={() => remove(b.id)}
                    className="text-xs text-white/30 hover:text-gasto"
                  >
                    Quitar
                  </button>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-white/40">
                  <Amount value={spent} currency={currency} />{' '}
                  de <Amount value={b.monthly_limit} currency={currency} />
                </p>
              </div>
            )
          })}
        </div>
      )}

      {availableCategories.length > 0 ? (
        <form onSubmit={add} className="mt-5 space-y-2 border-t border-bg-border pt-4">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-xl border border-bg-border bg-bg px-2 py-2.5 text-sm text-white outline-none focus:border-brand"
            >
              <option value="">Categoría</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              inputMode="decimal"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="Límite mensual"
              className="rounded-xl border border-bg-border bg-bg px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-brand"
            />
          </div>
          {error && <p className="text-sm text-gasto">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-bg-raised py-2 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {saving ? 'Agregando…' : '+ Agregar presupuesto'}
          </button>
        </form>
      ) : (
        budgets.length === 0 && (
          <p className="mt-3 text-xs text-white/30">
            Agregá categorías de gasto primero desde Ajustes.
          </p>
        )
      )}
    </div>
  )
}
