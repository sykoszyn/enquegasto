import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Account, Household } from '../types'

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL', 'UYU', 'CLP']

interface Props {
  accounts: Account[]
  households: Household[]
  onChange: () => void
}

export default function AccountManager({ accounts, households, onChange }: Props) {
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('ARS')
  const [householdId, setHouseholdId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const add = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('accounts')
      .insert({
        user_id: user?.id,
        name: name.trim(),
        currency,
        household_id: householdId || null,
      })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setName('')
    onChange()
  }

  const startRename = (a: Account) => {
    setRenamingId(a.id)
    setRenameValue(a.name)
  }

  const saveRename = async (id: string) => {
    if (!renameValue.trim()) return
    const { error } = await supabase
      .from('accounts')
      .update({ name: renameValue.trim() })
      .eq('id', id)
    if (error) {
      alert(error.message)
      return
    }
    setRenamingId(null)
    onChange()
  }

  const remove = async (id: string) => {
    const { count } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', id)

    if (count && count > 0) {
      alert(
        `Esta cuenta tiene ${count} movimiento(s) cargado(s). Para borrarla primero tenés que borrar o mover esos movimientos.`
      )
      return
    }
    if (!confirm('¿Borrar esta cuenta?')) return
    const { error } = await supabase.from('accounts').delete().eq('id', id)
    if (error) {
      alert(error.message)
      return
    }
    onChange()
  }

  return (
    <div className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
      <p className="text-sm font-semibold text-white/70">Cuentas</p>

      <form onSubmit={add} className="mt-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la cuenta"
          className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
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
          {saving ? 'Agregando…' : '+ Agregar cuenta'}
        </button>
      </form>

      <ul className="mt-5 space-y-1">
        {accounts.map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-bg">
            {renamingId === a.id ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  autoFocus
                  className="min-w-0 flex-1 rounded-lg border border-bg-border bg-bg px-2 py-1 text-sm text-white outline-none focus:border-brand"
                />
                <button onClick={() => saveRename(a.id)} className="text-xs text-brand">
                  Guardar
                </button>
                <button onClick={() => setRenamingId(null)} className="text-xs text-white/30">
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <span className="text-sm text-white/80">
                  {a.name} <span className="text-white/30">· {a.currency}</span>
                  {a.household_id && (
                    <span className="ml-1 rounded-md bg-ambar/15 px-1.5 py-0.5 text-[9px] font-semibold text-ambar">
                      COMPARTIDA
                    </span>
                  )}
                </span>
                <span className="flex gap-3 text-xs">
                  <button onClick={() => startRename(a)} className="text-white/30 hover:text-white">
                    Renombrar
                  </button>
                  <button onClick={() => remove(a.id)} className="text-white/30 hover:text-gasto">
                    Borrar
                  </button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
