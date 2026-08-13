"use client";

import { useState } from "react";
import { EnergyAllocation } from "@/lib/types";
import { ENERGY_PRESETS } from "@/lib/gameEngine";
import { Dumbbell, Crosshair, BookOpen, Users, Zap } from "lucide-react";

interface WeeklyEnergyAllocatorProps {
  onSubmit: (alloc: EnergyAllocation) => void;
  disabled?: boolean;
}

const CATEGORY_META = [
  { key: "dm" as const, label: "DM / Aim Lab", icon: Crosshair, color: "bg-cs-orange" },
  { key: "demos" as const, label: "Demos / Utility", icon: BookOpen, color: "bg-hltv-yellow" },
  { key: "pugs" as const, label: "Pugs FPL / FACEIT", icon: Users, color: "bg-faceit-orange" },
  { key: "gym" as const, label: "Gimnasio / Descanso", icon: Dumbbell, color: "bg-emerald-500" }
];

export default function WeeklyEnergyAllocator({ onSubmit, disabled }: WeeklyEnergyAllocatorProps) {
  const [alloc, setAlloc] = useState<EnergyAllocation>({ dm: 25, demos: 25, pugs: 25, gym: 25 });

  const total = alloc.dm + alloc.demos + alloc.pugs + alloc.gym;
  const valid = total === 100;

  function setValue(key: keyof EnergyAllocation, value: number) {
    setAlloc((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, value)) }));
  }

  return (
    <div className="bg-cs-panel border border-cs-border rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-cs-orange" />
          <h3 className="font-display text-lg font-bold text-cs-text uppercase tracking-wide">
            Energía de la semana
          </h3>
        </div>
        <span className={`text-xs font-mono ${valid ? "text-emerald-400" : "text-red-400"}`}>{total} / 100</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ENERGY_PRESETS.map((preset) => (
          <button
            key={preset.key}
            onClick={() => setAlloc(preset.alloc)}
            disabled={disabled}
            className="px-2.5 py-1 rounded border border-cs-border text-[11px] text-cs-muted hover:border-cs-orange hover:text-cs-orange transition-colors disabled:opacity-40"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {CATEGORY_META.map(({ key, label, icon: Icon, color }) => (
          <div key={key}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 text-cs-muted uppercase tracking-wide">
                <Icon size={13} /> {label}
              </span>
              <span className="text-cs-text font-mono">{alloc[key]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={alloc[key]}
              disabled={disabled}
              onChange={(e) => setValue(key, Number(e.target.value))}
              className="w-full accent-cs-orange"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => onSubmit(alloc)}
        disabled={disabled || !valid}
        className="w-full py-2.5 rounded bg-cs-orange text-black font-display font-bold uppercase tracking-wide disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cs-orangeDark transition-colors"
      >
        {valid ? "Confirmar semana" : `Ajustá el total a 100 (llevás ${total})`}
      </button>
    </div>
  );
}
