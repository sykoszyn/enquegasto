"use client";

import { MatchResult } from "@/lib/types";
import { Swords, Trophy, Skull } from "lucide-react";

interface MatchSimulatorProps {
  result: MatchResult;
  onContinue: () => void;
}

export default function MatchSimulator({ result, onContinue }: MatchSimulatorProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-cs-panel border border-cs-border rounded-lg max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Swords size={18} className="text-cs-orange" />
          <span className="text-xs uppercase tracking-widest font-semibold text-cs-muted">
            Resultado del partido
          </span>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold text-cs-text">vs {result.opponent}</h3>
          <span
            className={`px-3 py-1 rounded text-sm font-bold uppercase ${
              result.won ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {result.won ? "Victoria" : "Derrota"}
          </span>
        </div>

        <p className="text-sm text-cs-muted leading-relaxed italic">{result.narrative}</p>

        <div className="grid grid-cols-4 gap-3 py-3 border-y border-cs-border font-mono text-center">
          <div>
            <p className="text-lg text-hltv-yellow font-bold">{result.rating.toFixed(2)}</p>
            <p className="text-[10px] text-cs-muted uppercase">Rating</p>
          </div>
          <div>
            <p className="text-lg text-cs-text font-bold">{result.kills}</p>
            <p className="text-[10px] text-cs-muted uppercase">Kills</p>
          </div>
          <div>
            <p className="text-lg text-cs-text font-bold">{result.deaths}</p>
            <p className="text-[10px] text-cs-muted uppercase">Deaths</p>
          </div>
          <div>
            <p className="text-lg text-cs-text font-bold">{result.adr}</p>
            <p className="text-[10px] text-cs-muted uppercase">ADR</p>
          </div>
        </div>

        {result.clutchWon !== null && (
          <div className={`flex items-center gap-2 text-sm ${result.clutchWon ? "text-emerald-400" : "text-red-400"}`}>
            {result.clutchWon ? <Trophy size={16} /> : <Skull size={16} />}
            <span>{result.clutchWon ? "Clutch ganada" : "Clutch perdida"}</span>
          </div>
        )}

        <button
          onClick={onContinue}
          className="w-full py-3 rounded bg-cs-orange text-black font-display font-bold uppercase tracking-wide hover:bg-cs-orangeDark transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
