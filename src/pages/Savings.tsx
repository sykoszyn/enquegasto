import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { PiggyBank, Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import type { Household, SavingsContribution, SavingsGoal } from '../types'
import AppShell from '../components/AppShell'
import EmptyState from '../components/EmptyState'

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n)

function NewGoalForm({
  households,
  onCreated,
}: {
  households: Household[]
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [currency, setCurrency] = useState('ARS')
  const [targetDate, setTargetDate] = useState('')
  const [householdId, setHouseholdId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = Number(target.replace(/\./g, '').replace(',', '.'))
    if (!name.trim() || !parsed || parsed <= 0) {
      setError('Completá un nombre e importe válidos.')
      return
    }
    setSaving(true)
    setError(null)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase.from('savings_goals').insert({
      user_id: user?.id,
      name: name.trim(),
      target_amount: parsed,
      currency,
      target_date: targetDate || null,
      household_id: householdId || null,
    })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setName('')
    setTarget('')
    setTargetDate('')
    onCreated()
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
      <p className="text-sm font-semibold text-white/70">Nueva meta</p>
      <div className="mt-3 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Vacaciones"
          className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Importe objetivo"
            className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-brand"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
          >
            {['ARS', 'USD', 'EUR'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
        />
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
          className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-bg shadow-glow transition hover:brightness-110 disabled:opacity-50"
        >
          {saving ? 'Creando…' : '+ Crear meta'}
        </button>
      </div>
    </form>
  )
}

function GoalCard({
  goal,
  contributions,
  onChange,
}: {
  goal: SavingsGoal
  contributions: SavingsContribution[]
  onChange: () => void
}) {
  const [amount, setAmount] = useState('')
  const [adding, setAdding] = useState(false)

  const saved = contributions.reduce((s, c) => s + c.amount, 0)
  const pct = Math.min(100, Math.max(0, (saved / goal.target_amount) * 100))

  const addContribution = async () => {
    const parsed = Number(amount.replace(/\./g, '').replace(',', '.'))
    if (!parsed) return
    setAdding(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    await supabase
      .from('savings_contributions')
      .insert({ goal_id: goal.id, user_id: user?.id, amount: parsed })
    setAdding(false)
    setAmount('')
    onChange()
  }

  return (
    <div className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="font-bold text-white">
          {goal.name}
          {goal.household_id && (
            <span className="ml-2 rounded-md bg-ambar/15 px-1.5 py-0.5 text-[9px] font-semibold text-ambar">
              COMPARTIDA
            </span>
          )}
        </p>
        <p className="text-xs text-white/40">{pct.toFixed(0)}%</p>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-bg">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-violet transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 font-mono text-sm text-white/70">
        {fmt(saved, goal.currency)}{' '}
        <span className="text-white/30">de {fmt(goal.target_amount, goal.currency)}</span>
      </p>
      {goal.target_date && (
        <p className="mt-1 text-[11px] text-white/30">
          Meta: {new Date(goal.target_date).toLocaleDateString('es-AR')}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Agregar ahorro"
          className="min-w-0 flex-1 rounded-xl border border-bg-border bg-bg px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-brand"
        />
        <button
          onClick={addContribution}
          disabled={adding || !amount}
          className="flex items-center gap-1 rounded-xl bg-brand/15 px-3 py-2.5 text-xs font-bold text-brand transition hover:bg-brand/25 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function Savings() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [contributions, setContributions] = useState<SavingsContribution[]>([])
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [{ data: g }, { data: c }, { data: hs }] = await Promise.all([
      supabase.from('savings_goals').select('*').order('created_at'),
      supabase.from('savings_contributions').select('*'),
      supabase.from('households').select('*'),
    ])
    setGoals(g ?? [])
    setContributions(c ?? [])
    setHouseholds(hs ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const contributionsByGoal = useMemo(() => {
    const map: Record<string, SavingsContribution[]> = {}
    for (const c of contributions) {
      map[c.goal_id] = map[c.goal_id] ?? []
      map[c.goal_id].push(c)
    }
    return map
  }, [contributions])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-white/40 text-sm">
        Cargando ahorros…
      </div>
    )
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <PiggyBank className="h-5 w-5 text-brand" /> Ahorros
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Ponete una meta con importe y fecha, y andá sumando lo que ahorrás.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <NewGoalForm households={households} onCreated={load} />
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.length === 0 && (
              <div className="sm:col-span-2">
                <EmptyState
                  icon={PiggyBank}
                  title="Todavía no tenés ninguna meta"
                  body="Creá tu primera meta del lado izquierdo — vacaciones, un fondo de emergencia, lo que sea."
                />
              </div>
            )}
            {goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                contributions={contributionsByGoal[g.id] ?? []}
                onChange={load}
              />
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  )
}
