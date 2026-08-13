"use client";

import { Character, Phase } from "@/lib/types";
import { PHASE_LABELS } from "@/lib/gameEngine";
import { REGION_LABELS } from "@/lib/teams";
import StatBar from "./StatBar";
import TeamBadge from "./TeamBadge";
import { Zap, HeartPulse, Trophy, DollarSign, Star, Swords, Armchair, BatteryLow } from "lucide-react";

interface GameHUDProps {
  character: Character;
  phase: Phase;
}

export default function GameHUD({ character, phase }: GameHUDProps) {
  return (
    <div className="bg-cs-panel border border-cs-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-cs-border pb-3">
        <div>
          <h2 className="font-display text-xl font-bold text-cs-text tracking-wide">
            {character.nickname}
          </h2>
          <p className="text-xs text-cs-muted uppercase tracking-widest">
            {character.role} · {REGION_LABELS[character.region]} · {character.age} años
          </p>
        </div>
        <div className="text-right">
          <p className="text-hltv-yellow font-mono text-lg font-bold">{character.hltvRating.toFixed(2)}</p>
          <p className="text-[10px] text-cs-muted uppercase">HLTV Rating</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-cs-orange font-semibold uppercase tracking-wider">
          {character.team && <TeamBadge name={character.team.name} color={character.team.primaryColor} size={22} />}
          <span>
            {PHASE_LABELS[phase]}
            {character.team && <span className="text-cs-muted"> · {character.team.name}</span>}
          </span>
        </div>
        {character.benched && (
          <span className="flex items-center gap-1 text-[10px] text-red-400 font-semibold uppercase">
            <Armchair size={12} /> Banco
          </span>
        )}
      </div>

      <div className="space-y-2">
        <StatBar label="Aim" value={character.stats.aim} colorClass="bg-cs-orange" />
        <StatBar label="Utility / Brains" value={character.stats.utility} colorClass="bg-hltv-yellow" />
        <StatBar label="Clutch / Mindset" value={character.stats.clutch} colorClass="bg-faceit-orange" />
        <StatBar label="Mental" value={character.stats.mental} colorClass="bg-emerald-500" />
        <StatBar label="Comunicación" value={character.stats.comm} colorClass="bg-sky-500" />
        <StatBar label="Hinchada (fans)" value={character.fans} colorClass="bg-pink-500" />
        <StatBar label="Fatiga" value={character.fatigue} colorClass="bg-red-500" />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cs-border">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-cs-orange" />
          <span className="text-xs text-cs-muted">Forma: <span className="text-cs-text">{character.form}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <HeartPulse size={14} className="text-red-400" />
          <span className="text-xs text-cs-muted">Tilt: <span className="text-cs-text">{character.tilt}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Star size={14} className="text-hltv-yellow" />
          <span className="text-xs text-cs-muted">Rep: <span className="text-cs-text">{character.reputation}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-cs-orange" />
          <span className="text-xs text-cs-muted">Títulos: <span className="text-cs-text">{character.titles.length}</span></span>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <DollarSign size={14} className="text-emerald-400" />
          <span className="text-xs text-cs-muted">
            USD {character.money.usd.toLocaleString()} · ARS {character.money.ars.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-cs-border">
        <div className="flex items-center gap-2 mb-1.5 text-cs-muted">
          <Swords size={13} />
          <span className="text-[10px] uppercase tracking-widest font-semibold">Tu rival: {character.rival.nickname}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-cs-muted">{character.rival.team}</span>
          <span className="font-mono text-cs-text">
            {character.rival.hltvRating.toFixed(2)} rating · {character.rival.titles} títulos
          </span>
        </div>
      </div>

      {character.fatigue >= 70 && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
          <BatteryLow size={14} className="text-red-400" />
          <p className="text-[11px] text-red-300">Fatiga alta — bajale con descanso o va a afectar tu próximo partido.</p>
        </div>
      )}
    </div>
  );
}
