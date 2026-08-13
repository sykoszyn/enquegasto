interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  colorClass?: string;
}

export default function StatBar({ label, value, max = 100, colorClass = "bg-cs-orange" }: StatBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-mono text-cs-muted mb-1">
        <span className="uppercase tracking-wide">{label}</span>
        <span className="text-cs-text">{Math.round(value)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-cs-panel2 border border-cs-border overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
