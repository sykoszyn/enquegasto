import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { Transaction } from '../types'

interface Props {
  transactions: Transaction[]
  currency: string
}

const PALETTE = ['#FB5A6B', '#F5A623', '#8B7CF6', '#3DDC97', '#4C9AFF', '#F472B6']

export default function CategoryChart({ transactions, currency }: Props) {
  const gastos = transactions.filter((t) => t.kind === 'gasto')
  const byCategory = new Map<string, number>()
  for (const t of gastos) {
    const key = t.category?.name ?? 'Sin categoría'
    byCategory.set(key, (byCategory.get(key) ?? 0) + t.amount)
  }
  const data = Array.from(byCategory.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n)

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-bg-border p-10 text-center text-sm text-white/40">
        Anotá algún gasto para ver en qué se te va la plata.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
      <p className="text-sm font-semibold text-white/70">Por categoría</p>
      <div className="mt-2 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => fmt(Number(value))}
              contentStyle={{
                background: '#1C2130',
                border: '1px solid #272E42',
                borderRadius: 12,
                fontSize: 12,
                color: '#fff',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 space-y-1.5">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-white/60">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              {d.name}
            </span>
            <span className="tabular font-mono text-white/70">{fmt(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
