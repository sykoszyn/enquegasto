import { PAYMENT_METHOD_LABELS } from '../types'
import type { Transaction } from '../types'

export function downloadTransactionsCsv(transactions: Transaction[], currency: string) {
  const header = [
    'fecha',
    'tipo',
    'importe',
    'moneda',
    'categoria',
    'cuenta',
    'medio_de_pago',
    'descripcion',
  ]

  const rows = transactions.map((t) => [
    new Date(t.occurred_at).toISOString().slice(0, 10),
    t.kind,
    t.amount.toFixed(2),
    currency,
    t.category?.name ?? '',
    t.account?.name ?? '',
    PAYMENT_METHOD_LABELS[t.payment_method] ?? t.payment_method,
    (t.description ?? '').replace(/"/g, '""'),
  ])

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `en-que-gasto_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
