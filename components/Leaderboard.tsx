"use client";

import { useEffect, useState } from "react";
import { LeaderboardEntry } from "@/lib/types";
import { fetchLeaderboard } from "@/lib/persistence";
import { Trophy } from "lucide-react";

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-cs-panel border border-cs-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} className="text-hltv-yellow" />
        <h3 className="font-display text-lg font-bold text-cs-text uppercase tracking-wide">
          Leaderboard Global
        </h3>
      </div>

      {loading && <p className="text-xs text-cs-muted">Cargando carreras legendarias...</p>}

      {!loading && entries.length === 0 && (
        <p className="text-xs text-cs-muted">Todavía nadie levantó un Major. Podés ser el primero.</p>
      )}

      <div className="space-y-2">
        {entries.map((e, idx) => (
          <div
            key={e.id ?? idx}
            className="flex items-center justify-between text-sm border-b border-cs-border/50 pb-2 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-cs-muted font-mono w-5">{idx + 1}</span>
              <div>
                <p className="text-cs-text font-semibold">
                  {e.nickname}
                  {e.region && <span className="text-cs-orange text-[10px] ml-1.5 align-middle">{e.region}</span>}
                </p>
                <p className="text-[11px] text-cs-muted">{e.final_team}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-hltv-yellow font-mono font-bold">{e.hltv_rating.toFixed(2)}</p>
              <p className="text-[11px] text-cs-muted">
                {e.titles} títulos · ${e.prize_money_usd.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
