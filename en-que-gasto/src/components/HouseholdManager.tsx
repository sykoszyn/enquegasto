import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Household } from '../types'

export default function HouseholdManager() {
  const [households, setHouseholds] = useState<Household[]>([])
  const [membersByHousehold, setMembersByHousehold] = useState<Record<string, number>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUserId(user?.id ?? null)

    const { data: hs } = await supabase.from('households').select('*').order('created_at')
    setHouseholds(hs ?? [])

    const counts: Record<string, number> = {}
    if (hs) {
      for (const h of hs) {
        const { count } = await supabase
          .from('household_members')
          .select('id', { count: 'exact', head: true })
          .eq('household_id', h.id)
        counts[h.id] = count ?? 0
      }
    }
    setMembersByHousehold(counts)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createHousehold = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    setError(null)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('households')
      .insert({ name: name.trim(), owner_id: user?.id })
    setCreating(false)
    if (error) {
      setError(error.message)
      return
    }
    setName('')
    load()
  }

  const joinHousehold = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setJoining(true)
    setError(null)
    const { error } = await supabase.rpc('join_household_by_code', {
      code: code.trim().toLowerCase(),
    })
    setJoining(false)
    if (error) {
      setError(error.message)
      return
    }
    setCode('')
    load()
  }

  const leaveHousehold = async (householdId: string) => {
    if (!confirm('¿Salir de esta casa? Vas a dejar de ver sus cuentas compartidas.')) return
    await supabase
      .from('household_members')
      .delete()
      .eq('household_id', householdId)
      .eq('user_id', userId)
    load()
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
        <p className="text-sm text-white/40">Cargando…</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
      <p className="text-sm font-semibold text-white/70">Mi casa</p>
      <p className="mt-1 text-xs text-white/40">
        Compartí cuentas con tu pareja o familia. Las cuentas que marques como
        "de la casa" las va a ver todo el que sea miembro.
      </p>

      {households.length > 0 && (
        <ul className="mt-4 space-y-3">
          {households.map((h) => (
            <li key={h.id} className="rounded-xl border border-bg-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{h.name}</span>
                {h.owner_id !== userId && (
                  <button
                    onClick={() => leaveHousehold(h.id)}
                    className="text-xs text-white/30 hover:text-gasto"
                  >
                    Salir
                  </button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-white/40">
                {membersByHousehold[h.id] ?? 1} miembro(s)
                {h.owner_id === userId && ' · vos sos el/la creador/a'}
              </p>
              {h.owner_id === userId && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-lg bg-bg px-2 py-1 font-mono text-xs tracking-widest text-ambar">
                    {h.invite_code}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(h.invite_code)}
                    className="text-xs text-white/40 hover:text-white"
                  >
                    Copiar código
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <form onSubmit={createHousehold} className="space-y-2">
          <label className="text-xs text-white/40">Crear una casa</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Casa Sánchez"
            className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-xl bg-bg-raised py-2 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {creating ? 'Creando…' : '+ Crear casa'}
          </button>
        </form>

        <form onSubmit={joinHousehold} className="space-y-2">
          <label className="text-xs text-white/40">Unirse con un código</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de invitación"
            className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={joining}
            className="w-full rounded-xl bg-bg py-2 text-xs font-bold text-white/70 transition hover:text-white disabled:opacity-50"
          >
            {joining ? 'Uniendo…' : 'Unirme'}
          </button>
        </form>
      </div>

      {error && <p className="mt-3 text-sm text-gasto">{error}</p>}
    </div>
  )
}
