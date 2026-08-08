import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data.session) {
      navigate('/app')
    } else {
      setInfo('Revisá tu email para confirmar la cuenta.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-white">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-sm text-white/40 hover:text-white">
          ← En qué gasto?
        </Link>
        <h1 className="mt-6 text-2xl font-extrabold">Crear cuenta</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-white/40">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-bg-border bg-bg-surface px-4 py-3 text-sm text-white outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-xs text-white/40">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-bg-border bg-bg-surface px-4 py-3 text-sm text-white outline-none focus:border-brand"
            />
          </div>
          {error && <p className="text-sm text-gasto">{error}</p>}
          {info && <p className="text-sm text-brand">{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-bg shadow-glow transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Creando…' : 'Crear cuenta gratis'}
          </button>
        </form>
        <p className="mt-6 text-sm text-white/40">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-brand hover:underline">
            Entrá
          </Link>
        </p>
      </div>
    </div>
  )
}
