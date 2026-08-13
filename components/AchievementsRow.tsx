import { ACHIEVEMENTS } from "@/lib/gameEngine";
import { Award } from "lucide-react";

interface AchievementsRowProps {
  unlockedIds: string[];
}

export default function AchievementsRow({ unlockedIds }: AchievementsRowProps) {
  if (unlockedIds.length === 0) return null;

  return (
    <div className="bg-cs-panel border border-cs-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2 text-cs-muted">
        <Award size={14} />
        <span className="text-[11px] uppercase tracking-widest font-semibold">Logros ({unlockedIds.length})</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {unlockedIds.map((id) => {
          const a = ACHIEVEMENTS[id];
          if (!a) return null;
          return (
            <span
              key={id}
              title={a.description}
              className="text-[11px] px-2 py-1 rounded-full bg-hltv-yellow/10 border border-hltv-yellow/30 text-hltv-yellow font-semibold"
            >
              🏅 {a.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
