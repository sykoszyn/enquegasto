import Link from "next/link";
import Leaderboard from "@/components/Leaderboard";
import { Crosshair, Trophy, Gamepad2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-cs-orange text-xs uppercase tracking-[0.3em] font-semibold">
          <Gamepad2 size={16} />
          Simulador narrativo · CS2
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-black tracking-tight text-cs-text">
          ROAD TO <span className="text-cs-orange">MAJOR</span>
        </h1>
        <p className="text-cs-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Arrancás como FACEIT Level 1 jugando pugs a la madrugada. 60ms contra los servers de San
          Pablo, chicanas, tilteos en Discord y el sueño de toda la escena sudamericana: llegar a
          levantar un CS2 Major. Tomá las decisiones, mes a mes, año a año.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/game"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded bg-cs-orange text-black font-display font-bold text-lg uppercase tracking-wide hover:bg-cs-orangeDark transition-colors"
          >
            <Crosshair size={20} />
            Empezar la carrera
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-10 text-left">
          <div className="bg-cs-panel border border-cs-border rounded-lg p-4">
            <p className="text-cs-orange text-xs uppercase tracking-widest font-semibold mb-1">Fase 1-2</p>
            <p className="text-sm text-cs-text font-semibold">El barro de FACEIT y la escena AR</p>
            <p className="text-xs text-cs-muted mt-1">
              Pugs, mixes de Discord, qualifiers abiertas y la chance de fichar por RTT100.
            </p>
          </div>
          <div className="bg-cs-panel border border-cs-border rounded-lg p-4">
            <p className="text-cs-orange text-xs uppercase tracking-widest font-semibold mb-1">Fase 3-4</p>
            <p className="text-sm text-cs-text font-semibold">Tier 2 SA y el salto a Europa</p>
            <p className="text-xs text-cs-muted mt-1">
              La pica contra Brasil y, si la rompés, un bootcamp contra Vitality, NAVI o G2.
            </p>
          </div>
          <div className="bg-cs-panel border border-cs-border rounded-lg p-4">
            <p className="text-cs-orange text-xs uppercase tracking-widest font-semibold mb-1">Fase 5</p>
            <p className="text-sm text-cs-text font-semibold flex items-center gap-1">
              <Trophy size={14} className="text-hltv-yellow" /> El CS2 Major
            </p>
            <p className="text-xs text-cs-muted mt-1">
              Opening Stage, Elimination Stage y la Gran Final frente a miles de personas.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto mt-12">
        <Leaderboard />
      </div>
    </main>
  );
}
