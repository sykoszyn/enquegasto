import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Coffee, Car, Home as HomeIcon } from 'lucide-react'

const ROWS = [
  { icon: Coffee, label: 'Café con medialunas', amount: -3200, color: 'text-gasto', bg: 'bg-gasto/15' },
  { icon: Car, label: 'Nafta', amount: -21400, color: 'text-gasto', bg: 'bg-gasto/15' },
  { icon: HomeIcon, label: 'Alquiler', amount: -380000, color: 'text-gasto', bg: 'bg-gasto/15' },
]

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf: number
    const start = performance.now()
    const duration = 900
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active])
  return value
}

export default function AppPreview() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150)
    return () => clearTimeout(t)
  }, [])

  const balance = useCountUp(686900, mounted)

  return (
    <div className="relative mx-auto w-full max-w-sm animate-floatSlow select-none">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] glow-brand blur-2xl" />

      <div className="rounded-3xl border border-bg-border bg-bg-surface p-5 shadow-pop">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Te queda este mes</p>
            <p className="tabular mt-1 font-mono text-3xl font-bold text-white">
              ${balance.toLocaleString('es-AR')}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-lg font-extrabold text-bg">
            $
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gasto/10 p-3">
            <p className="flex items-center gap-1 text-[11px] text-gasto">
              <ArrowDownRight className="h-3.5 w-3.5" /> Gastos
            </p>
            <p className="tabular mt-1 font-mono text-sm font-bold text-white">$404.600</p>
          </div>
          <div className="rounded-2xl bg-brand/10 p-3">
            <p className="flex items-center gap-1 text-[11px] text-brand">
              <ArrowUpRight className="h-3.5 w-3.5" /> Ingresos
            </p>
            <p className="tabular mt-1 font-mono text-sm font-bold text-white">$1.091.500</p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {ROWS.map((r, i) => {
            const Icon = r.icon
            return (
              <div
                key={r.label}
                className="animate-popIn flex items-center justify-between rounded-2xl bg-bg-raised/60 p-3"
                style={{ animationDelay: `${300 + i * 120}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${r.bg}`}>
                    <Icon className={`h-4 w-4 ${r.color}`} />
                  </span>
                  <span className="text-sm text-white/85">{r.label}</span>
                </div>
                <span className={`tabular font-mono text-sm font-semibold ${r.color}`}>
                  -${Math.abs(r.amount).toLocaleString('es-AR')}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
