import { MatchResult } from "@/lib/types";
import { Swords, Trophy, TrendingDown } from "lucide-react";

interface MatchHistoryViewProps {
  matches: MatchResult[];
}

export default function MatchHistoryView({ matches }: MatchHistoryViewProps) {
  if (matches.length === 0) {
    return (
      <div className="bg-cs-panel border border-cs-border rounded-lg p-6 text-center">
        <Swords size={24} className="mx-auto text-cs-muted mb-2" />
        <p className="text-sm text-cs-muted">Todavía no jugaste ningún partido oficial.</p>
      </div>
    );
  }

  return (
    <div className="bg-cs-panel border border-cs-border rounded-lg p-4 space-y-2 max-h-[32rem] overflow-y-auto">
      {matches.map((m, idx) => (
        <div
          key={idx}
          className={`flex items-center justify-between p-3 rounded border ${
            m.won ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"
          }`}
        >
          <div className="flex items-center gap-2">
            {m.won ? <Trophy size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-red-400" />}
            <div>
              <p className="text-sm text-cs-text font-semibold">vs. {m.opponent}</p>
              {m.monthLabel && <p className="text-[10px] text-cs-muted">{m.monthLabel}</p>}
            </div>
          </div>
          <div className="text-right text-xs font-mono">
            <p className={m.won ? "text-emerald-400" : "text-red-400"}>{m.won ? "Victoria" : "Derrota"}</p>
            <p className="text-cs-muted">
              {m.rating.toFixed(2)} rating · {m.kills}/{m.deaths} · {m.adr} ADR
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
