import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Category, Kind } from '../types'

const SWATCHES = ['#FB5A6B', '#F5A623', '#3DDC97', '#8B7CF6', '#4C9AFF', '#F472B6', '#8B93A7']
const EMOJIS = ['🛒', '🚗', '🏠', '🎉', '💊', '💰', '🎬', '☕', '👕', '✈️', '📱', '🐾', '📚', '🎮', '💡']

interface Props {
  categories: Category[]
  onChange: () => void
}

export default function CategoryManager({ categories, onChange }: Props) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<Kind>('gasto')
  const [color, setColor] = useState(SWATCHES[0])
  const [icon, setIcon] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const add = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('categories')
      .insert({ user_id: user?.id, name: name.trim(), kind, color, icon })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setName('')
    setIcon(null)
    onChange()
  }

  const remove = async (id: string) => {
    if (!confirm('¿Borrar esta categoría? Los movimientos que la usaban van a quedar sin categoría.')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      alert(error.message)
      return
    }
    onChange()
  }

  const gastoCategories = categories.filter((c) => c.kind === 'gasto')
  const ingresoCategories = categories.filter((c) => c.kind === 'ingreso')

  return (
    <div className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
      <p className="text-sm font-semibold text-white/70">Categorías</p>

      <form onSubmit={add} className="mt-4 space-y-3">
        <div className="flex gap-2 rounded-xl bg-bg p-1">
          <button
            type="button"
            onClick={() => setKind('gasto')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
              kind === 'gasto' ? 'bg-gasto text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => setKind('ingreso')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
              kind === 'ingreso' ? 'bg-brand text-bg' : 'text-white/40 hover:text-white'
            }`}
          >
            Ingreso
          </button>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la categoría"
          className="w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
        />
        <div className="flex flex-wrap gap-1.5">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setIcon(icon === e ? null : e)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-base transition ${
                icon === e ? 'bg-brand/20 ring-1 ring-brand' : 'bg-bg hover:bg-bg-raised'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {SWATCHES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setColor(s)}
              className={`h-6 w-6 rounded-full transition ${color === s ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-surface' : ''}`}
              style={{ background: s }}
              aria-label={`Elegir color ${s}`}
            />
          ))}
        </div>
        {error && <p className="text-sm text-gasto">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-bg-raised py-2 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          {saving ? 'Agregando…' : '+ Agregar categoría'}
        </button>
      </form>

      <div className="mt-5 space-y-4">
        {[
          { label: 'Gastos', list: gastoCategories },
          { label: 'Ingresos', list: ingresoCategories },
        ].map((group) => (
          <div key={group.label}>
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/30">
              {group.label}
            </p>
            <ul className="mt-1.5 space-y-1">
              {group.list.length === 0 && (
                <li className="text-xs text-white/30">Todavía no hay ninguna.</li>
              )}
              {group.list.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-bg"
                >
                  <span className="flex items-center gap-2 text-sm text-white/80">
                    {c.icon ? (
                      <span className="text-base leading-none">{c.icon}</span>
                    ) : (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: c.color }}
                      />
                    )}
                    {c.name}
                  </span>
                  <button
                    onClick={() => remove(c.id)}
                    className="text-xs text-white/30 hover:text-gasto"
                  >
                    Borrar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
