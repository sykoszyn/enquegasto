"use client";

import { PreseasonCard } from "@/lib/types";
import { Sparkles } from "lucide-react";

interface PreseasonPickerProps {
  cards: PreseasonCard[];
  onPick: (card: PreseasonCard) => void;
  year: number;
}

export default function PreseasonPicker({ cards, onPick, year }: PreseasonPickerProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-cs-panel border border-hltv-yellow/40 rounded-lg max-w-xl w-full p-6 space-y-4 shadow-glow">
        <div className="flex items-center gap-2 text-hltv-yellow">
          <Sparkles size={18} />
          <span className="text-xs uppercase tracking-widest font-semibold">Pretemporada · Año {year}</span>
        </div>
        <h3 className="font-display text-2xl font-bold text-cs-text">Elegí cómo te preparás este año</h3>
        <p className="text-sm text-cs-muted">
          Antes de arrancar la temporada, tenés tiempo para invertir en vos mismo. Elegí una carta —
          las otras dos quedan en el camino.
        </p>
        <div className="grid grid-cols-1 gap-3 pt-2">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => onPick(card)}
              className="text-left p-4 rounded border border-cs-border bg-cs-panel2 hover:border-hltv-yellow hover:bg-hltv-yellow/5 transition-all"
            >
              <p className="text-sm font-bold text-cs-text">{card.title}</p>
              <p className="text-xs text-cs-muted mt-1">{card.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
