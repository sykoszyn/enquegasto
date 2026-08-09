import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney } from './Amount'
import { usePrivacy } from '../context/PrivacyContext'

interface Props {
  currentGasto: number
  previousGasto: number
  currentIngreso: number
  previousIngreso: number
  currency: string
}

export default function MonthCompareChart({
  currentGasto,
  previousGasto,
  currentIngreso,
  previousIngreso,
  currency,
}: Props) {
  const { hidden } = usePrivacy()

  const data = [
    { name: 'Mes anterior', Gastos: previousGasto, Ingresos: previousIngreso },
    { name: 'Este mes', Gastos: currentGasto, Ingresos: currentIngreso },
  ]

  return (
    <div className="rounded-2xl border border-bg-border bg-bg-surface p-5 shadow-card">
      <p className="text-sm font-semibold text-white/70">Este mes vs. mes anterior</p>
      <div className="mt-3 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#272E42" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#8B93A7', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              formatter={(value) => (hidden ? '***' : formatMoney(Number(value), currency))}
              contentStyle={{
                background: '#1C2130',
                border: '1px solid #272E42',
                borderRadius: 12,
                fontSize: 12,
                color: '#fff',
              }}
            />
            <Bar dataKey="Gastos" fill="#FB5A6B" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Ingresos" fill="#3DDC97" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
