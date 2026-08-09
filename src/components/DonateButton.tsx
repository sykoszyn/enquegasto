import { useState } from 'react'
import { Heart, X } from 'lucide-react'

const PRESETS = [1000, 2000, 5000]

export default function DonateButton() {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<number>(2000)
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finalAmount = custom ? Number(custom.replace(/\./g, '').replace(',', '.')) : amount

  const donate = async () => {
    if (!finalAmount || finalAmount <= 0) {
      setError('Ingresá un importe válido.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/donar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount }),
      })
      const data = await res.json()
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        setError(data.error || 'No pudimos generar el link de pago.')
      }
    } catch {
      setError('No pudimos conectarnos. Probá de nuevo en un rato.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl bg-bg-raised px-3.5 py-2 text-sm font-medium text-white/70 transition hover:text-white"
      >
        <Heart className="h-4 w-4 text-gasto" /> Apoyar el proyecto
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-pop"
          >
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                <Heart className="h-4 w-4 text-gasto" /> Apoyar el proyecto
              </p>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-white/50">
              En qué gasto? es gratis y sin publicidad. Si te sirve, podés
              bancar el proyecto con una donación única.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setAmount(p)
                    setCustom('')
                  }}
                  className={`rounded-xl py-2.5 text-sm font-bold transition ${
                    !custom && amount === p
                      ? 'bg-brand text-bg'
                      : 'bg-bg text-white/60 hover:text-white'
                  }`}
                >
                  ${p.toLocaleString('es-AR')}
                </button>
              ))}
            </div>

            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Otro importe (ARS)"
              inputMode="decimal"
              className="mt-3 w-full rounded-xl border border-bg-border bg-bg px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-brand"
            />

            {error && <p className="mt-2 text-sm text-gasto">{error}</p>}

            <button
              onClick={donate}
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-brand py-3 text-sm font-bold text-bg shadow-glow transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? 'Generando link…' : 'Donar con Mercado Pago'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
