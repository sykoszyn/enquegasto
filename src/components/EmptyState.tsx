import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  body?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon: Icon, title, body, action }: Props) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-bg-border p-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-raised">
        <Icon className="h-6 w-6 text-white/40" strokeWidth={1.75} />
      </span>
      <p className="mt-3 text-sm font-semibold text-white/70">{title}</p>
      {body && <p className="mt-1 max-w-xs text-xs text-white/40">{body}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-bg shadow-glow transition hover:brightness-110"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
