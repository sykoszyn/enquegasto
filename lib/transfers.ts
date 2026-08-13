import { Character, Phase, Team, TransferOffer } from "./types";
import { generateContractOffer } from "./contracts";
import { canAdvancePhase, nextPhase } from "./gameEngine";
import { teamsForPhase } from "./teams";

// ============================================================
// Transferencias — a diferencia de la vieja pantalla de "oferta"
// que interrumpía cada mes, las ofertas ahora se acumulan en una
// lista (`character.transferOffers`) y el jugador las revisa y
// acepta cuando quiere, desde la pestaña Transferencias.
// ============================================================

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeOfferId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const SIGNING_NOTES = [
  "Un ojeador te vio jugar y le gustó lo que vio.",
  "El manager te sigue hace semanas en las qualifiers.",
  "Alguien de la organización te tiró un mensaje directo.",
  "Te recomendó un excompañero que ya está adentro."
];

const PROMOTION_NOTES = [
  "Tus números vienen llamando la atención de organizaciones más grandes.",
  "Un scout de nivel superior te marcó en su planilla después del último torneo.",
  "Circula tu nombre en los grupos de mercado de pases del tier de arriba."
];

const LATERAL_NOTES = [
  "Un equipo rival está dispuesto a pagar tu cláusula completa.",
  "Te ofrecen mejores condiciones para dejar tu equipo actual ya mismo.",
  "Se cansaron de perder contra vos y prefieren tenerte de su lado."
];

// Intenta generar UNA oferta de transferencia nueva para este mes.
// Devuelve null la mayoría de las veces — no cada mes hay novedades.
export function maybeGenerateTransferOffer(character: Character, phase: Phase): TransferOffer | null {
  if (phase === "major") return null;

  const existingTeamIds = new Set(character.transferOffers.map((o) => o.team.id));
  if (character.team) existingTeamIds.add(character.team.id);

  // Caso 1: agente libre — ofertas para el tier actual (o el primer contrato profesional)
  if (!character.team || !character.contract) {
    if (phase === "faceit" && !canAdvancePhase(character, "faceit")) return null;
    if (Math.random() > 0.35) return null;
    const pool = teamsForPhase(phase === "faceit" ? "tier3" : phase, character.region).filter((t) => !existingTeamIds.has(t.id));
    if (pool.length === 0) return null;
    const team = pool[Math.floor(Math.random() * pool.length)];
    const contract = generateContractOffer(team, character);
    return {
      id: makeOfferId(),
      team,
      contract,
      kind: "signing",
      feeUsd: 0,
      note: SIGNING_NOTES[rand(0, SIGNING_NOTES.length - 1)]
    };
  }

  // Caso 2: promoción de tier — sólo si ya cumplís el umbral de reputación
  if (canAdvancePhase(character, phase)) {
    if (Math.random() > 0.35) return null;
    const np = nextPhase(phase);
    if (!np) return null;
    const pool = teamsForPhase(np === "major" ? "tier1" : np, character.region).filter((t) => !existingTeamIds.has(t.id));
    if (pool.length === 0) return null;
    const team = pool[Math.floor(Math.random() * pool.length)];
    const contract = generateContractOffer(team, character);
    const feeUsd = Math.round(contract.salaryUsd * rand(2, 5));
    return {
      id: makeOfferId(),
      team,
      contract,
      kind: "promotion",
      feeUsd,
      note: PROMOTION_NOTES[rand(0, PROMOTION_NOTES.length - 1)]
    };
  }

  // Caso 3: oferta lateral (poaching) de un rival del mismo tier — más probable con reputación alta
  if (character.reputation >= 35 && Math.random() < 0.12) {
    const pool = teamsForPhase(phase, character.region).filter((t) => !existingTeamIds.has(t.id) && t.id !== character.team?.id);
    if (pool.length === 0) return null;
    const team = pool[Math.floor(Math.random() * pool.length)];
    const contract = generateContractOffer(team, character);
    const feeUsd = character.contract.rescissionClauseUsd;
    return {
      id: makeOfferId(),
      team,
      contract,
      kind: "lateral",
      feeUsd,
      note: LATERAL_NOTES[rand(0, LATERAL_NOTES.length - 1)]
    };
  }

  return null;
}

export function addTransferOffer(character: Character, offer: TransferOffer | null): Character {
  if (!offer) return character;
  const offers = [offer, ...character.transferOffers].slice(0, 4);
  return { ...character, transferOffers: offers };
}

export function removeTransferOffer(character: Character, offerId: string): Character {
  return { ...character, transferOffers: character.transferOffers.filter((o) => o.id !== offerId) };
}

// Acepta una oferta: firma el nuevo contrato, cobra el fee de fichaje
// (si corresponde) y determina si esto implica avanzar de fase.
export function acceptTransferOffer(
  character: Character,
  phase: Phase,
  offer: TransferOffer
): { character: Character; phase: Phase; log: string } {
  const isPromotionByTier = !character.team || character.team.tier !== offer.team.tier;
  const newPhase = phase === "faceit" || isPromotionByTier ? nextPhase(phase) ?? phase : phase;

  const updated: Character = {
    ...character,
    team: offer.team,
    contract: offer.contract,
    benched: false,
    money: { ...character.money, usd: character.money.usd + offer.feeUsd },
    transferOffers: character.transferOffers.filter((o) => o.id !== offer.id)
  };

  const feeText = offer.feeUsd > 0 ? ` Cobrás una prima de fichaje de $${offer.feeUsd.toLocaleString()}.` : "";
  const log = `Fichás por ${offer.team.name} como ${offer.contract.assignedRole}: $${offer.contract.salaryUsd.toLocaleString()}/mes por ${offer.contract.durationMonths} meses.${feeText}`;

  return { character: updated, phase: newPhase, log };
}
