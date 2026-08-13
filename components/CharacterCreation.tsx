"use client";

import { useState, ReactNode } from "react";
import { Character, Region, Role } from "@/lib/types";
import { createCharacter } from "@/lib/gameEngine";
import { Crosshair, Eye, Target, Shield, Mic } from "lucide-react";

interface CharacterCreationProps {
  onCreate: (character: Character) => void;
}

const ROLES: { role: Role; icon: ReactNode; desc: string }[] = [
  { role: "Entry", icon: <Crosshair size={20} />, desc: "El primero en entrar. Aim y reflejos por encima de todo." },
  { role: "Lurker", icon: <Eye size={20} />, desc: "Paciencia y lectura del mapa. Golpea cuando nadie lo espera." },
  { role: "AWP", icon: <Target size={20} />, desc: "Una bala, una vida. Precisión quirúrgica con el francotirador." },
  { role: "Support", icon: <Shield size={20} />, desc: "Utility perfecta para que el equipo entre limpio." },
  { role: "IGL", icon: <Mic size={20} />, desc: "El cerebro táctico. Menos frags, más decisiones." }
];

const REGIONS: { region: Region; label: string }[] = [
  { region: "SA", label: "Sudamérica (ARG)" },
  { region: "NA", label: "Norteamérica" },
  { region: "EU", label: "Europa" }
];

export default function CharacterCreation({ onCreate }: CharacterCreationProps) {
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState<Role>("Entry");
  const [region, setRegion] = useState<Region>("SA");

  const handleSubmit = () => {
    const character = createCharacter(nickname.trim(), role, region);
    onCreate(character);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-display text-4xl font-black tracking-tight text-cs-text">
          ROAD TO <span className="text-cs-orange">MAJOR</span>
        </h1>
        <p className="text-cs-muted text-sm">
          FACEIT Level 1. Un sueño. Y la escena sudamericana de por medio.
        </p>
      </div>

      <div className="bg-cs-panel border border-cs-border rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-cs-muted mb-2">Nickname</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="ej: elpibedelretake"
            maxLength={20}
            className="w-full bg-cs-panel2 border border-cs-border rounded px-3 py-2 text-cs-text font-mono focus:outline-none focus:border-cs-orange"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-cs-muted mb-3">Rol principal</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => setRole(r.role)}
                className={`flex items-start gap-3 p-3 rounded border text-left transition-all ${
                  role === r.role
                    ? "border-cs-orange bg-cs-orange/10"
                    : "border-cs-border bg-cs-panel2 hover:border-cs-muted"
                }`}
              >
                <div className={role === r.role ? "text-cs-orange" : "text-cs-muted"}>{r.icon}</div>
                <div>
                  <p className="font-semibold text-sm text-cs-text">{r.role}</p>
                  <p className="text-xs text-cs-muted">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-cs-muted mb-3">Región inicial</label>
          <div className="flex gap-2">
            {REGIONS.map((r) => (
              <button
                key={r.region}
                onClick={() => setRegion(r.region)}
                className={`flex-1 py-2 rounded border text-sm font-semibold transition-all ${
                  region === r.region
                    ? "border-hltv-yellow bg-hltv-yellow/10 text-hltv-yellow"
                    : "border-cs-border bg-cs-panel2 text-cs-muted hover:border-cs-muted"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!nickname.trim()}
          className="w-full py-3 rounded bg-cs-orange text-black font-display font-bold text-lg tracking-wide uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cs-orangeDark transition-colors"
        >
          Empezar la carrera
        </button>
      </div>
    </div>
  );
}
