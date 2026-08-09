import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import type { Account, Category, Kind } from '../types'

export default function QuickAddFab() {
  const [open, setOpen] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [kind, setKind] = useState<Kind>('gasto')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    ;(async () => {
      const [{ data: acc }, { data: cat }] = await Promise.all([
        supabase.from('accounts').select('*').order('created_at'),
        supabase.from('categories').select('*').order('name'),
      ])
      setAccounts(acc ?? [])
      setCategories(cat ?? [])
      setAccountId(acc?.[0]?.id ?? '')
    })()
  }, [open])

  const filteredCategories = categories.filter((c) => c.kind === kind)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = Number(amount.replace(/\./g, '').replace(',', '.'))
    if (!parsed || parsed <= 0 || !accountId) return
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    await supabase.from('transactions').insert({
      user_id: user?.id,
      account_id: accountId,
      category_id: categoryId || null,
      kind,
      amount: parsed,
      payment_method: 'transferencia_qr',
      occurred_at: new Date().toISOString(),
    })
    setSaving(false)
    setAmount('')
    setOpen(false)
    // refresca la página actual para que el nuevo movimiento se vea al toque
    window.location.reload()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gasto text-white shadow-glow transition hover:-translate-y-0.5 hover:brightness-110 sm:bottom-5"
        aria-label="Cargar gasto rápido"
      >
        <Plus className="h-6 w-6" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={onSubmit}
            className="w-full max-w-sm rounded-t-3xl border border-bg-border bg-bg-surface p-5 shadow-pop sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">Carga rápida</p>
              <button type="button" onClick={() => setOpen(false)} className="text-white/40">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex gap-2 rounded-xl bg-bg p-1">
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
              autoFocus
              inputMode="decimal"
              placeholder="$ 0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-3 w-full rounded-xl border border-bg-border bg-bg px-4 py-3 font-mono text-2xl font-bold text-white outline-none placeholder:text-white/20 focus:border-brand"
            />

            <div className="mt-3 grid grid-cols-2 gap-2">
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

            <button
              type="submit"
              disabled={saving || !amount}
              className="mt-4 w-full rounded-xl bg-brand py-3 text-sm font-bold text-bg shadow-glow transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Anotar'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
