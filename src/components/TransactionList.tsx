import type { Transaction } from '../types'
import { PAYMENT_METHOD_LABELS } from '../types'
import Amount from './Amount'

interface Props {
  transactions: Transaction[]
  currency: string
  onDelete: (id: string) => void
  onEdit: (t: Transaction) => void
}

export default function TransactionList({ transactions, currency, onDelete, onEdit }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-bg-border p-10 text-center text-sm text-white/40">
        Todavía no anotaste nada.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-bg-border bg-bg-surface shadow-card">
      <div className="px-5 py-4">
        <p className="text-sm font-semibold text-white/70">Movimientos</p>
      </div>
      <ul className="divide-y divide-bg-border/60">
        {transactions.map((t) => (
          <li
            key={t.id}
            className="group flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-bg-raised/40"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="h-8 w-8 shrink-0 rounded-xl"
                style={{ background: `${t.category?.color ?? '#8B93A7'}22` }}
              >
                <span
                  className="mx-auto mt-[11px] block h-2 w-2 rounded-full"
                  style={{ background: t.category?.color ?? '#8B93A7' }}
                />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {t.description || t.category?.name || 'Movimiento'}
                </p>
                <p className="truncate text-[11px] text-white/35">
                  {new Date(t.occurred_at).toLocaleDateString('es-AR')} ·{' '}
                  {t.category?.name ?? 'Sin categoría'} ·{' '}
                  {PAYMENT_METHOD_LABELS[t.payment_method] ?? 'Transferencia/QR'}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span
                className={`tabular whitespace-nowrap font-mono text-sm font-bold ${
                  t.kind === 'gasto' ? 'text-gasto' : 'text-brand'
                }`}
              >
                {t.kind === 'gasto' ? '-' : '+'}
                <Amount value={t.amount} currency={t.account?.currency ?? currency} />
              </span>
              <span className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={() => onEdit(t)}
                  className="rounded-lg px-1.5 py-1 text-white/30 hover:text-ambar"
                  aria-label="Editar movimiento"
                >
                  ✎
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="rounded-lg px-1.5 py-1 text-white/30 hover:text-gasto"
                  aria-label="Borrar movimiento"
                >
                  ✕
                </button>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
