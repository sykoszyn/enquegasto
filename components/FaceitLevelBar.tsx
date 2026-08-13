import { faceitLevelProgress } from "@/lib/gameEngine";
import { Flame } from "lucide-react";

interface FaceitLevelBarProps {
  elo: number;
}

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-slate-400", 2: "bg-slate-400", 3: "bg-slate-400",
  4: "bg-orange-400", 5: "bg-orange-400", 6: "bg-orange-400",
  7: "bg-red-500", 8: "bg-red-500",
  9: "bg-emerald-400",
  10: "bg-hltv-yellow"
};

export default function FaceitLevelBar({ elo }: FaceitLevelBarProps) {
  const { level, floor, ceil, pct } = faceitLevelProgress(elo);

  return (
    <div className="bg-cs-panel border border-cs-border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-cs-orange" />
          <span className="text-xs uppercase tracking-widest font-semibold text-cs-muted">FACEIT</span>
        </div>
        <span className="font-mono text-xs text-cs-muted">{elo} Elo</span>
      </div>
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded font-display font-black text-black text-lg shrink-0 ${LEVEL_COLORS[level]}`}
        >
          {level}
        </div>
        <div className="flex-1">
          <div className="h-2.5 w-full rounded-full bg-cs-panel2 border border-cs-border overflow-hidden">
            <div
              className={`h-full rounded-full ${LEVEL_COLORS[level]} transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-cs-muted font-mono mt-1">
            <span>{floor}</span>
            <span>{level < 10 ? ceil : "sin techo"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
