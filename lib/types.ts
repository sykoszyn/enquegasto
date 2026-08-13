// ============================================================
// RoadToMajor — Tipos centrales del simulador
// ============================================================

export type Role = "Entry" | "Lurker" | "AWP" | "Support" | "IGL";

export type Region = "SA" | "NA" | "EU";

// Las fases son genéricas: el contenido real (equipos, rivales,
// nombres de torneos) se resuelve según la región elegida por el jugador.
export type Phase =
  | "faceit" // Fase 1: El barro de FACEIT (pugs, mixes, qualifiers abiertas)
  | "tier3" // Fase 2: Escena local / amateur de la región elegida
  | "tier2" // Fase 3: Competitivo regional (la pelea por clasificar afuera)
  | "tier1" // Fase 4: Salto al Tier 1 mundial
  | "major"; // Fase 5: El CS2 Major

export interface Stats {
  aim: number; // Puntería / mecánica
  utility: number; // Utility / lectura del juego ("Brains")
  clutch: number; // Clutch / Mindset bajo presión
  mental: number; // Mental / resistencia al tilt
  comm: number; // Comunicación / IGL-ability
}

export type StatKey = keyof Stats;

// Rol asignado dentro del equipo — puede diferir de tu rol "natural"
export type AssignedRole = "Titular" | "Suplente" | "IGL" | "AWP";

export interface Contract {
  teamId: string;
  teamName: string;
  salaryUsd: number; // mensual
  assignedRole: AssignedRole;
  durationMonths: number; // duración original del contrato
  monthsRemaining: number;
  rescissionClauseUsd: number;
  salaryCut: boolean; // si ya se le recortó el sueldo por bajo rendimiento
}

// Oferta de transferencia: aparece en la pestaña Transferencias.
// El jugador decide cuándo (y si) aceptarla — no interrumpe el loop principal.
export type TransferKind = "signing" | "promotion" | "lateral";

export interface TransferOffer {
  id: string;
  team: Team;
  contract: Contract;
  kind: TransferKind; // signing = primer contrato / agente libre, promotion = sube de tier, lateral = mismo tier
  feeUsd: number; // "fee" de fichaje que se lleva el jugador como prima de firma
  note: string; // flavor text de por qué llegó esta oferta
}

// Distribución semanal de energía (100 puntos) entre actividades
export interface EnergyAllocation {
  dm: number; // DM / Aim Lab
  demos: number; // Estudio de demos / utility
  pugs: number; // Pugs de FPL / FACEIT
  gym: number; // Gimnasio / descanso
}

// Post del feed de redes/prensa generado dinámicamente
export interface PressPost {
  id: string;
  author: string;
  handle: string;
  text: string;
  kind: "fan" | "br_fan" | "caster" | "press";
}

export interface Achievement {
  id: string;
  label: string;
  description: string;
}

export interface Character {
  nickname: string;
  role: Role;
  region: Region;
  age: number; // arranca en 16
  stats: Stats;
  hltvRating: number; // promedio histórico
  form: number; // -100 a 100, estado de forma actual (afecta próximos partidos)
  tilt: number; // 0 a 100, nivel de tilteo acumulado
  fatigue: number; // 0-100, desgaste físico/mental por sobre-entrenar
  fans: number; // 0-100, "idolatría" — cuánto te sigue la comunidad/hinchada
  faceitElo: number; // ELO real de FACEIT (100+), determina el Nivel 1-10
  money: {
    ars: number;
    usd: number;
  };
  inventory: SkinItem[];
  team: Team | null;
  contract: Contract | null;
  benched: boolean; // ¿estás en el banco de suplentes?
  recentRatings: number[]; // últimos partidos, para evaluar rendimiento del contrato
  reputation: number; // 0-100, prestigio en la escena competitiva
  titles: string[];
  achievements: string[]; // ids de logros desbloqueados
  rival: Rival;
  matchHistory: MatchResult[];
  pressFeed: PressPost[];
  transferOffers: TransferOffer[];
  seenEventIds: string[]; // eventos "once" ya vistos, para no repetirlos
  careerStats: {
    matchesPlayed: number;
    matchesWon: number;
    totalKills: number;
    totalDeaths: number;
    prizeMoneyUsd: number;
  };
}

// El "rival de toda la vida": un NPC que arranca al mismo tiempo que vos
// y progresa en paralelo. Al retirarte, se compara tu carrera con la suya.
export interface Rival {
  nickname: string;
  team: string;
  hltvRating: number;
  titles: number;
}

export interface SkinItem {
  id: string;
  name: string;
  priceUsd: number;
  confidenceBoost: number; // impacta "form" al equiparlo/abrirlo
  rarity: "Consumer" | "Mil-Spec" | "Restricted" | "Classified" | "Covert" | "Contraband";
}

export type TeamTier = "local" | "tier2" | "tier1";

export interface Team {
  id: string;
  name: string;
  tier: TeamTier;
  region: Region;
  roster: string[]; // nombres de jugadores del roster real (2026)
  description: string;
  primaryColor: string; // hex — usado para el "escudo" de iniciales en la UI
}

export interface GameEvent {
  id: string;
  phase: Phase | "any";
  title: string;
  description: string;
  choices: GameChoice[];
  // condición opcional para que el evento aparezca (ej. sólo en cierta región, o con equipo)
  condition?: (c: Character) => boolean;
  weight?: number; // probabilidad relativa
  once?: boolean; // si es true, no vuelve a aparecer en la misma carrera
}

export interface GameChoice {
  label: string;
  // efecto sobre el personaje al elegir esta opción
  apply: (c: Character) => { character: Character; log: string };
}

export interface MatchResult {
  opponent: string;
  won: boolean;
  rating: number;
  kills: number;
  deaths: number;
  adr: number;
  clutchWon: boolean | null;
  narrative: string;
  monthLabel?: string; // para el historial de partidos
}

export interface MonthlyFocus {
  key: "dm" | "vod" | "lineups" | "rest" | "team_practice";
  label: string;
  description: string;
}

// Cartas de mejora de pretemporada (una vez por año, estilo "El Ídolo")
export interface PreseasonCard {
  id: string;
  title: string;
  description: string;
  apply: (c: Character) => { character: Character; log: string };
}

export interface SaveGame {
  id?: string;
  user_id?: string;
  character: Character;
  phase: Phase;
  month: number; // mes acumulado desde el inicio (0 = enero de año 1)
  log: string[];
  created_at?: string;
  updated_at?: string;
}

export interface LeaderboardEntry {
  id?: string;
  nickname: string;
  titles: number;
  hltv_rating: number;
  prize_money_usd: number;
  final_team: string;
  region?: Region;
  created_at?: string;
}

// Comparación final de carrera contra una "leyenda" real del CS2
export interface LegendComparison {
  tierLabel: string;
  legendName: string;
  blurb: string;
}
