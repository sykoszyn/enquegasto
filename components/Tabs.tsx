"use client";

import { ReactNode } from "react";
import { LayoutDashboard, FileText, Swords, Newspaper, ShoppingBag, ArrowRightLeft } from "lucide-react";

export type GameTab = "dashboard" | "team" | "transfers" | "matches" | "press" | "inventory";

interface TabsProps {
  active: GameTab;
  onChange: (tab: GameTab) => void;
  pressCount: number;
  transferCount: number;
}

const TABS: { key: GameTab; label: string; icon: ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
  { key: "team", label: "Equipo & Contrato", icon: <FileText size={15} /> },
  { key: "transfers", label: "Transferencias", icon: <ArrowRightLeft size={15} /> },
  { key: "matches", label: "Partidos & Torneos", icon: <Swords size={15} /> },
  { key: "press", label: "Redes & Prensa", icon: <Newspaper size={15} /> },
  { key: "inventory", label: "Inventario", icon: <ShoppingBag size={15} /> }
];

export default function Tabs({ active, onChange, pressCount, transferCount }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-4 border-b border-cs-border pb-3">
      {TABS.map((tab) => {
        const badgeCount = tab.key === "press" ? pressCount : tab.key === "transfers" ? transferCount : 0;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide transition-colors ${
              active === tab.key
                ? "bg-cs-orange text-black"
                : "bg-cs-panel2 text-cs-muted border border-cs-border hover:text-cs-text hover:border-cs-orange"
            }`}
          >
            {tab.icon}
            {tab.label}
            {badgeCount > 0 && (
              <span className="ml-1 bg-hltv-yellow text-black text-[10px] font-bold px-1.5 rounded-full">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
