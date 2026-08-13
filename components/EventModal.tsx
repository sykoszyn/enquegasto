"use client";

import { GameEvent } from "@/lib/types";
import { MessageCircle } from "lucide-react";

interface EventModalProps {
  event: GameEvent;
  onChoice: (choiceIndex: number) => void;
}

export default function EventModal({ event, onChoice }: EventModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-cs-panel border border-cs-orange/40 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-glow">
        <div className="flex items-center gap-2 text-cs-orange">
          <MessageCircle size={18} />
          <span className="text-xs uppercase tracking-widest font-semibold">Evento</span>
        </div>
        <h3 className="font-display text-2xl font-bold text-cs-text">{event.title}</h3>
        <p className="text-sm text-cs-muted leading-relaxed">{event.description}</p>
        <div className="space-y-2 pt-2">
          {event.choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => onChoice(idx)}
              className="w-full text-left px-4 py-3 rounded border border-cs-border bg-cs-panel2 hover:border-cs-orange hover:bg-cs-orange/10 transition-all text-sm text-cs-text"
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
