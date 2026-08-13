"use client";

import { useState } from "react";
import Link from "next/link";
import { Character, EnergyAllocation, GameEvent, MatchResult, Phase, PreseasonCard, SkinItem, TransferOffer } from "@/lib/types";
import {
  applyWeeklyEnergy,
  checkAchievements,
  checkBenchStatus,
  computeLegendComparison,
  isCareerOver,
  opponentForPhase,
  pickPreseasonCards,
  progressRival,
  simulateMatch
} from "@/lib/gameEngine";
import { pickRandomEvent } from "@/lib/events";
import { processMonthlyContract } from "@/lib/contracts";
import { acceptTransferOffer, addTransferOffer, maybeGenerateTransferOffer, removeTransferOffer } from "@/lib/transfers";
import { saveGame, submitToLeaderboard } from "@/lib/persistence";

import CharacterCreation from "@/components/CharacterCreation";
import GameHUD from "@/components/GameHUD";
import WeeklyEnergyAllocator from "@/components/WeeklyEnergyAllocator";
import EventModal from "@/components/EventModal";
import MatchSimulator from "@/components/MatchSimulator";
import PreseasonPicker from "@/components/PreseasonPicker";
import Tabs, { GameTab } from "@/components/Tabs";
import ContractCard from "@/components/ContractCard";
import MatchHistoryView from "@/components/MatchHistoryView";
import PressFeedView from "@/components/PressFeedView";
import InventoryTab from "@/components/InventoryTab";
import TransfersTab from "@/components/TransfersTab";
import FaceitLevelBar from "@/components/FaceitLevelBar";
import AchievementsRow from "@/components/AchievementsRow";
import { Trophy, RefreshCw, ScrollText } from "lucide-react";

type Step = "preseason" | "focus" | "event" | "match" | "end";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function GamePage() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [phase, setPhase] = useState<Phase>("faceit");
  const [month, setMonth] = useState(0); // meses acumulados desde el inicio
  const [log, setLog] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("focus");
  const [tab, setTab] = useState<GameTab>("dashboard");
  const [pendingEvent, setPendingEvent] = useState<GameEvent | null>(null);
  const [pendingMatch, setPendingMatch] = useState<MatchResult | null>(null);
  const [preseasonCards, setPreseasonCards] = useState<PreseasonCard[]>([]);
  const [wonMajor, setWonMajor] = useState(false);
  const [majorStage, setMajorStage] = useState(0); // 0 = opening, 1 = elim, 2 = playoffs
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function pushLog(entry: string) {
    setLog((prev) => [entry, ...prev].slice(0, 60));
  }

  function pushLogs(entries: string[]) {
    if (entries.length === 0) return;
    setLog((prev) => [...[...entries].reverse(), ...prev].slice(0, 60));
  }

  function handleCreate(c: Character) {
    setCharacter(c);
    pushLog(`${c.nickname} debuta en la escena. Nivel FACEIT 1. Empieza el sueño.`);
    pushLog(`Tu rival de toda la vida, ${c.rival.nickname}, arranca su carrera al mismo tiempo que vos.`);
    setStep("focus");
  }

  function handleWeeklyEnergy(alloc: EnergyAllocation) {
    if (!character) return;
    const { character: updated, log: entry } = applyWeeklyEnergy(character, alloc);
    setCharacter(updated);
    pushLog(entry);

    // ¿Dispara un evento narrativo este mes? (45% de probabilidad)
    if (Math.random() < 0.45) {
      const event = pickRandomEvent(updated, phase);
      if (event) {
        setPendingEvent(event);
        setStep("event");
        return;
      }
    }
    proceedToMatchOrClose(updated);
  }

  function handleEventChoice(choiceIndex: number) {
    if (!character || !pendingEvent) return;
    const { character: updated, log: entry } = pendingEvent.choices[choiceIndex].apply(character);
    const withSeen = pendingEvent.once ? { ...updated, seenEventIds: [...updated.seenEventIds, pendingEvent.id] } : updated;
    setCharacter(withSeen);
    pushLog(entry);
    setPendingEvent(null);
    proceedToMatchOrClose(withSeen);
  }

  function proceedToMatchOrClose(c: Character) {
    // Si estás en el banco de suplentes, no jugás este mes.
    if (c.benched) {
      closeMonth(c);
      return;
    }

    const matchChance = c.team ? 0.7 : 0.5;
    if (phase !== "major" && Math.random() < matchChance) {
      const opponent = opponentForPhase(phase, c.region, c);
      const monthLabel = `${MONTH_NAMES[month % 12]} · Año ${Math.floor(month / 12) + 1}`;
      const { result, character: afterMatch } = simulateMatch(c, opponent, phase, monthLabel);
      setCharacter(afterMatch);
      setPendingMatch(result);
      setStep("match");
    } else if (phase === "major") {
      runMajorStage(c);
    } else {
      closeMonth(c);
    }
  }

  function handleMatchContinue() {
    if (!character) return;
    setPendingMatch(null);
    closeMonth(character);
  }

  function closeMonth(c: Character) {
    const newMonth = month + 1;
    let updated = progressRival(c, phase);

    if (newMonth % 12 === 0) {
      updated = { ...updated, age: updated.age + 1 };
      pushLog(`Cumplís ${updated.age} años. El reloj de la carrera sigue corriendo.`);
    }

    // Contrato: cobrar sueldo, descontar mes, chequear vencimiento/renovación
    const contractResult = processMonthlyContract(updated);
    updated = contractResult.character;
    pushLogs(contractResult.log);

    // Banco de suplentes: chequear rendimiento reciente
    const benchResult = checkBenchStatus(updated);
    updated = benchResult.character;
    pushLogs(benchResult.log);

    // Logros
    const achResult = checkAchievements(updated, { justUnbenched: benchResult.justUnbenched });
    updated = achResult.character;
    pushLogs(achResult.log);

    // Transferencias: puede sumarse una oferta nueva a la lista (no interrumpe el juego)
    const offer = maybeGenerateTransferOffer(updated, phase);
    if (offer) {
      updated = addTransferOffer(updated, offer);
      pushLog(`📩 Nueva oferta de transferencia de ${offer.team.name} disponible en la pestaña Transferencias.`);
    }

    setCharacter(updated);
    setMonth(newMonth);

    // ¿Terminó la carrera por edad?
    if (isCareerOver(updated, phase, wonMajor)) {
      setStep("end");
      return;
    }

    // Pretemporada: al cumplir años (excepto el arranque) se eligen cartas de mejora
    if (newMonth % 12 === 0) {
      setPreseasonCards(pickPreseasonCards(3));
      setStep("preseason");
      return;
    }

    setStep("focus");
  }

  function handlePreseasonPick(card: PreseasonCard) {
    if (!character) return;
    const { character: updated, log: entry } = card.apply(character);
    setCharacter(updated);
    pushLog(entry);
    setPreseasonCards([]);
    setStep("focus");
  }

  function handleAcceptTransfer(offer: TransferOffer) {
    if (!character) return;
    const { character: updated, phase: newPhase, log: entry } = acceptTransferOffer(character, phase, offer);
    setCharacter(updated);
    if (newPhase !== phase) setPhase(newPhase);
    pushLog(entry);
    if (newPhase === "major" && phase !== "major") {
      pushLog("¡Clasificaste al CS2 Major!");
    }
  }

  function handleDeclineTransfer(offerId: string) {
    if (!character) return;
    setCharacter(removeTransferOffer(character, offerId));
  }

  function runMajorStage(c: Character) {
    const stageNames = ["Opening Stage", "Elimination Stage", "Gran Final"];
    const opponent = opponentForPhase("major", c.region, c);
    const monthLabel = `${stageNames[majorStage]} · Año ${Math.floor(month / 12) + 1}`;
    const { result, character: afterMatch } = simulateMatch(c, opponent, "major", monthLabel);
    setCharacter(afterMatch);
    setPendingMatch({ ...result, narrative: `[${stageNames[majorStage]}] ${result.narrative}` });
    setStep("match");
  }

  // Continuación especial para partidos del Major (se engancha después de cerrar el modal)
  function handleMajorMatchContinue() {
    if (!character || !pendingMatch) return;
    const won = pendingMatch.won;
    setPendingMatch(null);

    if (!won) {
      pushLog(`Quedaste eliminado del Major. El sueño sigue vivo para el próximo evento.`);
      closeMonth(character);
      return;
    }

    if (majorStage >= 2) {
      // Ganaste la Gran Final
      const champion: Character = {
        ...character,
        titles: [...character.titles, "CS2 Major Champion"],
        careerStats: { ...character.careerStats, prizeMoneyUsd: character.careerStats.prizeMoneyUsd + 500000 },
        money: { ...character.money, usd: character.money.usd + 500000 }
      };
      const { character: withAchievements, log: achLog } = checkAchievements(champion);
      setCharacter(withAchievements);
      pushLogs(achLog);
      setWonMajor(true);
      pushLog("¡¡¡CAMPEONES DEL MUNDO!!! Levantás el trofeo del CS2 Major frente a todo el estadio.");
      setStep("end");
      return;
    }

    setMajorStage((s) => s + 1);
    pushLog(`Avanzás de ronda en el Major.`);
    closeMonth(character);
  }

  function handleBuySkin(item: SkinItem) {
    if (!character) return;
    if (character.money.usd < item.priceUsd) return;
    const updated: Character = {
      ...character,
      money: { ...character.money, usd: character.money.usd - item.priceUsd },
      form: Math.max(-100, Math.min(100, character.form + item.confidenceBoost)),
      inventory: [...character.inventory, item]
    };
    setCharacter(updated);
    pushLog(`Te compraste ${item.name}. +${item.confidenceBoost} Forma (confianza visual).`);
  }

  async function handleSubmitLeaderboard() {
    if (!character) return;
    setSaving(true);
    await submitToLeaderboard({
      nickname: character.nickname,
      titles: character.titles.length,
      hltv_rating: character.hltvRating,
      prize_money_usd: character.careerStats.prizeMoneyUsd,
      final_team: character.team?.name ?? "Free Agent",
      region: character.region
    });
    await saveGame({ character, phase, month, log });
    setSaving(false);
    setSaved(true);
  }

  function handleRestart() {
    setCharacter(null);
    setPhase("faceit");
    setMonth(0);
    setLog([]);
    setStep("focus");
    setTab("dashboard");
    setPendingEvent(null);
    setPendingMatch(null);
    setPreseasonCards([]);
    setWonMajor(false);
    setMajorStage(0);
    setSaved(false);
  }

  // ---------------------------------------------------------------
  // Render: creación de personaje
  // ---------------------------------------------------------------
  if (!character) {
    return (
      <main className="min-h-screen px-4 py-10">
        <CharacterCreation onCreate={handleCreate} />
      </main>
    );
  }

  const monthLabel = `${MONTH_NAMES[month % 12]} · Año ${Math.floor(month / 12) + 1}`;

  // ---------------------------------------------------------------
  // Render: pantalla final de carrera
  // ---------------------------------------------------------------
  if (step === "end") {
    const legend = computeLegendComparison(character);
    const beatRival = character.hltvRating >= character.rival.hltvRating && character.titles.length >= character.rival.titles;

    return (
      <main className="min-h-screen px-4 py-10 flex items-center justify-center">
        <div className="max-w-lg w-full bg-cs-panel border border-cs-border rounded-lg p-6 space-y-4 text-center">
          <Trophy size={40} className={`mx-auto ${wonMajor ? "text-hltv-yellow" : "text-cs-muted"}`} />
          <h2 className="font-display text-3xl font-bold text-cs-text">
            {wonMajor ? "¡Campeón del Major!" : "Fin de la carrera"}
          </h2>
          <p className="text-sm text-cs-muted">
            {character.nickname} se retira a los {character.age} años con un HLTV Rating histórico
            de {character.hltvRating.toFixed(2)}.
          </p>

          <div className="grid grid-cols-2 gap-3 text-left text-sm py-3 border-y border-cs-border">
            <p className="text-cs-muted">Títulos: <span className="text-cs-text font-semibold">{character.titles.length}</span></p>
            <p className="text-cs-muted">Prize money: <span className="text-cs-text font-semibold">${character.careerStats.prizeMoneyUsd.toLocaleString()}</span></p>
            <p className="text-cs-muted">Partidos: <span className="text-cs-text font-semibold">{character.careerStats.matchesPlayed}</span></p>
            <p className="text-cs-muted">Win rate: <span className="text-cs-text font-semibold">
              {character.careerStats.matchesPlayed > 0
                ? Math.round((character.careerStats.matchesWon / character.careerStats.matchesPlayed) * 100)
                : 0}%
            </span></p>
          </div>

          {character.achievements.length > 0 && (
            <div className="text-left">
              <AchievementsRow unlockedIds={character.achievements} />
            </div>
          )}

          <div className="bg-cs-panel2 border border-hltv-yellow/30 rounded p-3 text-left">
            <p className="text-[11px] uppercase tracking-widest text-hltv-yellow font-semibold mb-1">{legend.tierLabel}</p>
            <p className="text-xs text-cs-muted">
              Tu carrera se compara con la de <span className="text-cs-text font-semibold">{legend.legendName}</span>. {legend.blurb}
            </p>
          </div>

          <div className="bg-cs-panel2 border border-cs-border rounded p-3 text-left">
            <p className="text-[11px] uppercase tracking-widest text-cs-muted font-semibold mb-1">
              Vs. {character.rival.nickname} (tu rival)
            </p>
            <p className="text-xs text-cs-text">
              Vos: {character.hltvRating.toFixed(2)} rating, {character.titles.length} títulos · Él: {character.rival.hltvRating.toFixed(2)} rating, {character.rival.titles} títulos.
              {" "}
              <span className={beatRival ? "text-emerald-400" : "text-red-400"}>
                {beatRival ? "Le ganaste la carrera." : "Terminó por delante tuyo."}
              </span>
            </p>
          </div>

          {!saved ? (
            <button
              onClick={handleSubmitLeaderboard}
              disabled={saving}
              className="w-full py-3 rounded bg-cs-orange text-black font-display font-bold uppercase tracking-wide disabled:opacity-50 hover:bg-cs-orangeDark transition-colors"
            >
              {saving ? "Guardando..." : "Subir al Leaderboard Global"}
            </button>
          ) : (
            <p className="text-emerald-400 text-sm">¡Carrera guardada en el Leaderboard!</p>
          )}

          <button
            onClick={handleRestart}
            className="w-full py-3 rounded border border-cs-border text-cs-text font-semibold flex items-center justify-center gap-2 hover:border-cs-orange transition-colors"
          >
            <RefreshCw size={16} /> Empezar otra carrera
          </button>
          <Link href="/" className="block text-xs text-cs-muted hover:text-cs-orange">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------
  // Render: loop principal del juego (con pestañas)
  // ---------------------------------------------------------------
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-widest text-cs-muted font-semibold">{monthLabel}</div>
        </div>

        <Tabs
          active={tab}
          onChange={setTab}
          pressCount={Math.min(character.pressFeed.length, 9)}
          transferCount={character.transferOffers.length}
        />

        {tab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <div className="space-y-4">
              <GameHUD character={character} phase={phase} />
              {phase === "faceit" && <FaceitLevelBar elo={character.faceitElo} />}
              <AchievementsRow unlockedIds={character.achievements} />
              <div className="bg-cs-panel border border-cs-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-cs-muted">
                  <ScrollText size={14} />
                  <span className="text-[11px] uppercase tracking-widest font-semibold">Historial</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {log.map((entry, idx) => (
                    <p key={idx} className="text-xs text-cs-muted leading-snug border-b border-cs-border/40 pb-1.5 last:border-0">
                      {entry}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {step === "focus" && (
                <WeeklyEnergyAllocator onSubmit={handleWeeklyEnergy} disabled={!!pendingEvent || !!pendingMatch} />
              )}

              {step === "event" && pendingEvent && <EventModal event={pendingEvent} onChoice={handleEventChoice} />}

              {step === "match" && pendingMatch && (
                <MatchSimulator
                  result={pendingMatch}
                  onContinue={phase === "major" ? handleMajorMatchContinue : handleMatchContinue}
                />
              )}

              {step === "preseason" && preseasonCards.length > 0 && (
                <PreseasonPicker cards={preseasonCards} onPick={handlePreseasonPick} year={Math.floor(month / 12) + 1} />
              )}
            </div>
          </div>
        )}

        {tab === "team" && <ContractCard character={character} />}

        {tab === "transfers" && (
          <TransfersTab offers={character.transferOffers} onAccept={handleAcceptTransfer} onDecline={handleDeclineTransfer} />
        )}

        {tab === "matches" && <MatchHistoryView matches={character.matchHistory} />}

        {tab === "press" && <PressFeedView posts={character.pressFeed} />}

        {tab === "inventory" && <InventoryTab character={character} onBuy={handleBuySkin} />}
      </div>
    </main>
  );
}
