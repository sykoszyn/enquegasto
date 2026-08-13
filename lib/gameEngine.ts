import { Achievement, Character, EnergyAllocation, LegendComparison, MatchResult, Phase, PreseasonCard, Region, Role, SkinItem, Stats, Team } from "./types";
import { generateFaceitOpponentName, generateRivalName, teamsForPhase } from "./teams";
import { generatePressFeed } from "./press";
import { SHOP_ITEMS } from "./skins";

// ============================================================
// Motor del simulador — RoadToMajor
// ============================================================

export const PHASE_ORDER: Phase[] = ["faceit", "tier3", "tier2", "tier1", "major"];

export const PHASE_LABELS: Record<Phase, string> = {
  faceit: "El barro de FACEIT",
  tier3: "Tier 3 · Escena Local",
  tier2: "Tier 2 · Competitivo Regional",
  tier1: "Salto al Tier 1 Mundial",
  major: "CS2 Major"
};

// Puntos de reputación/rating necesarios para avanzar de fase
export const PHASE_THRESHOLDS: Record<Phase, number> = {
  faceit: 25,
  tier3: 40,
  tier2: 60,
  tier1: 80,
  major: 999
};

export const ENERGY_PRESETS: { key: string; label: string; alloc: EnergyAllocation }[] = [
  { key: "balanced", label: "Equilibrado", alloc: { dm: 25, demos: 25, pugs: 25, gym: 25 } },
  { key: "aim", label: "Foco en Aim", alloc: { dm: 45, demos: 15, pugs: 25, gym: 15 } },
  { key: "brains", label: "Foco en IGL/Utility", alloc: { dm: 15, demos: 40, pugs: 20, gym: 25 } },
  { key: "grind", label: "Grindeo de pugs", alloc: { dm: 20, demos: 15, pugs: 45, gym: 20 } },
  { key: "chill", label: "Semana tranquila", alloc: { dm: 10, demos: 10, pugs: 10, gym: 70 } }
];

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ------------------------------------------------------------
// Niveles de FACEIT (Elo real, brackets oficiales 2026)
// ------------------------------------------------------------
export const FACEIT_LEVEL_THRESHOLDS = [100, 501, 751, 901, 1051, 1201, 1351, 1551, 1701, 2001];

export function computeFaceitLevel(elo: number): number {
  let level = 1;
  for (let i = 0; i < FACEIT_LEVEL_THRESHOLDS.length; i++) {
    if (elo >= FACEIT_LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

export function faceitLevelProgress(elo: number): { level: number; floor: number; ceil: number; pct: number } {
  const level = computeFaceitLevel(elo);
  const floor = FACEIT_LEVEL_THRESHOLDS[level - 1];
  const ceil = level < 10 ? FACEIT_LEVEL_THRESHOLDS[level] : floor + 500;
  const pct = clamp(Math.round(((elo - floor) / (ceil - floor)) * 100));
  return { level, floor, ceil, pct };
}

export function createCharacter(nickname: string, role: Role, region: Region): Character {
  const base: Stats = { aim: 35, utility: 30, clutch: 25, mental: 40, comm: 25 };

  // Ajustes iniciales según el rol elegido
  const roleBoost: Record<Role, Partial<Stats>> = {
    Entry: { aim: 10, clutch: 5 },
    Lurker: { utility: 8, clutch: 8 },
    AWP: { aim: 12 },
    Support: { utility: 12, comm: 5 },
    IGL: { comm: 15, utility: 5, aim: -5 }
  };

  const boosted: Stats = { ...base };
  const b = roleBoost[role];
  (Object.keys(b) as (keyof Stats)[]).forEach((k) => {
    boosted[k] = clamp(boosted[k] + (b[k] ?? 0));
  });

  return {
    nickname: nickname || "Anon1337",
    role,
    region,
    age: 16,
    stats: boosted,
    hltvRating: 0.95,
    form: 0,
    tilt: 10,
    fatigue: 10,
    fans: 2,
    faceitElo: 150,
    money: { ars: 50000, usd: 0 },
    inventory: [],
    team: null,
    contract: null,
    benched: false,
    recentRatings: [],
    reputation: 5,
    titles: [],
    achievements: [],
    matchHistory: [],
    pressFeed: [],
    transferOffers: [],
    seenEventIds: [],
    rival: {
      nickname: generateRivalName(region),
      team: "Free Agent",
      hltvRating: 0.95,
      titles: 0
    },
    careerStats: { matchesPlayed: 0, matchesWon: 0, totalKills: 0, totalDeaths: 0, prizeMoneyUsd: 0 }
  };
}

// ------------------------------------------------------------
// Gestión semanal de energía: 100 puntos a repartir entre
// DM / Demos / Pugs / Gimnasio.
// ------------------------------------------------------------
const TRAINING_INTROS = [
  "Semana de entrenamiento",
  "Otra semana de laburo",
  "Rutina de la semana",
  "Semana a pura práctica",
  "Bloque de entrenamiento"
];

export function applyWeeklyEnergy(character: Character, alloc: EnergyAllocation): { character: Character; log: string } {
  const c = { ...character, stats: { ...character.stats } };
  const notes: string[] = [];

  if (alloc.dm > 0) {
    const gain = Math.round((alloc.dm / 25) * rand(1, 3));
    c.stats.aim = clamp(c.stats.aim + gain);
    c.fatigue = clamp(c.fatigue + Math.round(alloc.dm * 0.15));
    if (gain > 0) notes.push(`+${gain} Aim`);
  }
  if (alloc.demos > 0) {
    const gain = Math.round((alloc.demos / 25) * rand(1, 3));
    c.stats.utility = clamp(c.stats.utility + gain);
    c.fatigue = clamp(c.fatigue + Math.round(alloc.demos * 0.08));
    if (gain > 0) notes.push(`+${gain} Utility`);
  }
  if (alloc.pugs > 0) {
    const repGain = Math.round((alloc.pugs / 25) * rand(1, 3));
    const clutchGain = Math.round((alloc.pugs / 50) * rand(0, 2));
    c.reputation = clamp(c.reputation + repGain);
    c.stats.clutch = clamp(c.stats.clutch + clutchGain);
    c.tilt = clamp(c.tilt + Math.round(alloc.pugs * 0.12));
    c.fatigue = clamp(c.fatigue + Math.round(alloc.pugs * 0.12));
    if (repGain > 0) notes.push(`+${repGain} Reputación`);
    if (clutchGain > 0) notes.push(`+${clutchGain} Clutch`);
  }
  if (alloc.gym > 0) {
    const fatigueLoss = Math.round(alloc.gym * 0.35);
    const mentalGain = Math.round((alloc.gym / 25) * rand(0, 2));
    c.fatigue = clamp(c.fatigue - fatigueLoss);
    c.tilt = clamp(c.tilt - Math.round(alloc.gym * 0.15));
    c.stats.mental = clamp(c.stats.mental + mentalGain);
    if (mentalGain > 0) notes.push(`+${mentalGain} Mental`);
    notes.push(`-${fatigueLoss} Fatiga`);
  }

  const intro = TRAINING_INTROS[rand(0, TRAINING_INTROS.length - 1)];
  const log = `${intro} (DM ${alloc.dm} / Demos ${alloc.demos} / Pugs ${alloc.pugs} / Gym ${alloc.gym}). ${notes.join(", ") || "Sin cambios notables."}.`;
  return { character: c, log };
}

// Convierte los stats + forma + tilt + fatiga en un HLTV Rating 2.0 aproximado para un partido puntual
function computeMatchRating(c: Character): number {
  const skillScore =
    c.stats.aim * 0.35 + c.stats.utility * 0.2 + c.stats.clutch * 0.2 + c.stats.mental * 0.15 + c.stats.comm * 0.1;

  const formModifier = c.form / 100; // -1 a 1
  const tiltPenalty = (c.tilt / 100) * 0.3; // hasta -0.3
  const fatiguePenalty = (c.fatigue / 100) * 0.2; // hasta -0.2
  const benchPenalty = c.benched ? 0.15 : 0; // jugar poco también pasa factura

  // Rating base entre ~0.55 y ~1.55
  let rating = 0.55 + (skillScore / 100) * 1.0 + formModifier * 0.25 - tiltPenalty - fatiguePenalty - benchPenalty;
  rating += (Math.random() - 0.5) * 0.3; // variación random del partido
  return Math.max(0.2, Math.round(rating * 100) / 100);
}

export function simulateMatch(character: Character, opponent: Team, phase: Phase, monthLabel?: string): { result: MatchResult; character: Character } {
  const rating = computeMatchRating(character);
  const won = rating + (Math.random() - 0.5) * 0.4 > 1.0;

  const rounds = 24 + rand(-2, 6);
  const kills = Math.round(rating * rounds * 0.62 + rand(-3, 3));
  const deaths = Math.round(rounds * 0.6 + rand(-3, 3));
  const adr = Math.round(rating * 78 + rand(-8, 8));

  let clutchWon: boolean | null = null;
  let narrative = "";

  const clutchChance = 0.3;
  if (Math.random() < clutchChance) {
    const clutchRoll = character.stats.clutch / 100 + (Math.random() - 0.5) * 0.5;
    clutchWon = clutchRoll > 0.45;
    narrative = clutchWon
      ? `1v2 en el retake, con el corazón en la boca — la cerraste y la gente en el chat explotó.`
      : `Tuviste la clutch a mano pero se te escapó por poco. Un "next map" amargo.`;
  } else {
    narrative = won
      ? `Partido sólido de principio a fin contra ${opponent.name}.`
      : `${opponent.name} fue superior en los momentos clave del mapa.`;
  }

  const result: MatchResult = {
    opponent: opponent.name,
    won,
    rating,
    kills: Math.max(0, kills),
    deaths: Math.max(0, deaths),
    adr: Math.max(0, adr),
    clutchWon,
    narrative,
    monthLabel
  };

  const newCareer = {
    matchesPlayed: character.careerStats.matchesPlayed + 1,
    matchesWon: character.careerStats.matchesWon + (won ? 1 : 0),
    totalKills: character.careerStats.totalKills + result.kills,
    totalDeaths: character.careerStats.totalDeaths + result.deaths,
    prizeMoneyUsd: character.careerStats.prizeMoneyUsd + (won ? rand(50, 400) : 0)
  };

  const newHltv = Math.round(((character.hltvRating * (newCareer.matchesPlayed - 1) + rating) / newCareer.matchesPlayed) * 100) / 100;

  const repDelta = won ? rand(2, 6) : rand(-4, 1);
  const tiltDelta = won ? rand(-4, 0) : rand(2, 8);
  const formDelta = won ? rand(3, 10) : rand(-10, -2);
  const fansDelta = won ? rand(1, 4) : rand(-2, 0);

  const recentRatings = [...character.recentRatings, rating].slice(-5);
  const matchHistory = [result, ...character.matchHistory].slice(0, 30);

  // Durante la fase FACEIT, el resultado también mueve el Elo real (±15 a ±30, como en la plataforma)
  const eloDelta = phase === "faceit" ? (won ? rand(15, 30) : -rand(15, 30)) : 0;

  let updated: Character = {
    ...character,
    hltvRating: newHltv,
    reputation: clamp(character.reputation + repDelta),
    tilt: clamp(character.tilt + tiltDelta),
    fatigue: clamp(character.fatigue + rand(3, 8)),
    form: clamp(character.form + formDelta, -100, 100),
    fans: clamp(character.fans + fansDelta),
    faceitElo: Math.max(100, character.faceitElo + eloDelta),
    careerStats: newCareer,
    recentRatings,
    matchHistory,
    money: { ...character.money, usd: character.money.usd + (won ? rand(50, 400) : 0) }
  };

  // Generar reacciones de redes/prensa después del partido (a partir de Tier 3 en adelante)
  if (phase !== "faceit") {
    const newPosts = generatePressFeed(updated, result);
    updated = { ...updated, pressFeed: [...newPosts, ...updated.pressFeed].slice(0, 40) };
  }

  return { result, character: updated };
}

export function opponentForPhase(phase: Phase, region: Region, character?: Character): Team {
  if (phase === "faceit") {
    const level = character ? computeFaceitLevel(character.faceitElo) : 1;
    return {
      id: "faceit-mix",
      name: generateFaceitOpponentName(region, level),
      tier: "local",
      region,
      roster: [],
      description: "",
      primaryColor: "#64748b"
    };
  }
  const pool = teamsForPhase(phase === "major" ? "tier1" : phase, region);
  if (pool.length === 0) {
    return { id: "generic", name: "Rival genérico", tier: "local", region, roster: [], description: "", primaryColor: "#64748b" };
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export function canAdvancePhase(character: Character, phase: Phase): boolean {
  return character.reputation >= PHASE_THRESHOLDS[phase];
}

export function nextPhase(phase: Phase): Phase | null {
  const idx = PHASE_ORDER.indexOf(phase);
  if (idx === -1 || idx === PHASE_ORDER.length - 1) return null;
  return PHASE_ORDER[idx + 1];
}

// Determina si la carrera terminó (por edad límite o por ganar el Major)
export function isCareerOver(character: Character, phase: Phase, wonMajor: boolean): boolean {
  return character.age >= 29 || wonMajor;
}

// ------------------------------------------------------------
// Banco de suplentes: si el promedio de tus últimos partidos
// bajo contrato cae por debajo de 1.00, hay chance de que la
// organización te mande al banco. Estando ahí, no jugás y tu
// reputación se estanca hasta que remontás.
// ------------------------------------------------------------
export function checkBenchStatus(character: Character): { character: Character; log: string[]; justUnbenched: boolean } {
  const log: string[] = [];
  if (!character.contract || character.recentRatings.length < 3) return { character, log, justUnbenched: false };

  const avg = character.recentRatings.reduce((a, b) => a + b, 0) / character.recentRatings.length;

  if (!character.benched && avg < 1.0 && Math.random() < 0.35) {
    const cutContract = character.contract.salaryCut
      ? character.contract
      : { ...character.contract, salaryUsd: Math.round(character.contract.salaryUsd * 0.7), salaryCut: true };
    log.push(
      `Con un promedio de ${avg.toFixed(2)} en tus últimos partidos, ${character.contract.teamName} te manda al banco de suplentes y te recorta el sueldo.`
    );
    return { character: { ...character, benched: true, contract: cutContract, fans: clamp(character.fans - 8) }, log, justUnbenched: false };
  }

  if (character.benched && Math.random() < 0.4) {
    log.push(`Después de entrenar fuerte, ${character.contract.teamName} te devuelve el lugar de titular.`);
    const contract = character.contract.assignedRole === "Suplente" ? { ...character.contract, assignedRole: "Titular" as const } : character.contract;
    return { character: { ...character, benched: false, contract }, log, justUnbenched: true };
  }

  if (character.benched) {
    // Mientras estás en el banco, la reputación se estanca un poco
    return { character: { ...character, reputation: clamp(character.reputation - 1) }, log, justUnbenched: false };
  }

  return { character, log, justUnbenched: false };
}

// ------------------------------------------------------------
// Rival: progresa en paralelo, mes a mes, con su propia carrera.
// No se simula partido a partido: alcanza con una evolución
// pseudo-aleatoria que dé sensación de "carrera espejo".
// ------------------------------------------------------------
export function progressRival(character: Character, phase: Phase): Character {
  const rival = { ...character.rival };
  rival.hltvRating = Math.max(0.4, Math.round((rival.hltvRating + (Math.random() - 0.45) * 0.06) * 100) / 100);
  if (Math.random() < 0.015) {
    rival.titles += 1;
  }
  if (Math.random() < 0.08) {
    rival.team = rivalTeamNameForPhase(phase, character.region);
  }
  return { ...character, rival };
}

export function rivalTeamNameForPhase(phase: Phase, region: Region): string {
  const pool = teamsForPhase(phase === "major" ? "tier1" : phase, region);
  if (pool.length === 0) return "Free Agent";
  return pool[Math.floor(Math.random() * pool.length)].name;
}

// ------------------------------------------------------------
// Cartas de pretemporada — una vez por año se eligen 3 al azar
// entre estas, estilo "El Ídolo".
// ------------------------------------------------------------
export const PRESEASON_CARD_POOL: PreseasonCard[] = [
  {
    id: "bootcamp_intensivo",
    title: "Bootcamp intensivo de verano",
    description: "Semanas encerrado practicando con el equipo. +6 Aim, +4 Utility.",
    apply: (c) => {
      const character = { ...c, stats: { ...c.stats, aim: clamp(c.stats.aim + 6), utility: clamp(c.stats.utility + 4) } };
      return { character, log: "Bootcamp de verano completado. +6 Aim, +4 Utility." };
    }
  },
  {
    id: "psicologo_deportivo",
    title: "Psicólogo deportivo del equipo",
    description: "Trabajo mental con un profesional. +8 Mental, -15 Tilt base.",
    apply: (c) => {
      const character = { ...c, stats: { ...c.stats, mental: clamp(c.stats.mental + 8) }, tilt: clamp(c.tilt - 15) };
      return { character, log: "Sesiones con el psicólogo del equipo. +8 Mental, -15 Tilt." };
    }
  },
  {
    id: "curso_liderazgo",
    title: "Curso de liderazgo e IGL",
    description: "Aprendiste a armar estrategias complejas. +8 Comunicación, +3 Clutch.",
    apply: (c) => {
      const character = { ...c, stats: { ...c.stats, comm: clamp(c.stats.comm + 8), clutch: clamp(c.stats.clutch + 3) } };
      return { character, log: "Curso de liderazgo aprobado. +8 Comunicación, +3 Clutch." };
    }
  },
  {
    id: "nueva_config",
    title: "Nueva config y setup de torneo",
    description: "Mouse, mousepad y monitor nuevos. +5 Aim, +5 Forma.",
    apply: (c) => {
      const character = { ...c, stats: { ...c.stats, aim: clamp(c.stats.aim + 5) }, form: clamp(c.form + 5, -100, 100) };
      return { character, log: "Setup nuevo instalado. +5 Aim, +5 Forma." };
    }
  },
  {
    id: "estudio_demos_top",
    title: "Estudiar demos de los mejores del mundo",
    description: "Analizaste partidas de ZywOo y compañía. +7 Utility, +3 Clutch.",
    apply: (c) => {
      const character = { ...c, stats: { ...c.stats, utility: clamp(c.stats.utility + 7), clutch: clamp(c.stats.clutch + 3) } };
      return { character, log: "Analizaste demos de los mejores del mundo. +7 Utility, +3 Clutch." };
    }
  },
  {
    id: "campaña_redes",
    title: "Campaña en redes con tu equipo",
    description: "Contenido, streams y clips virales. +10 Hinchada (fans).",
    apply: (c) => {
      const character = { ...c, fans: clamp(c.fans + 10) };
      return { character, log: "Se viralizaron tus clips. +10 Hinchada." };
    }
  },
  {
    id: "descanso_familiar",
    title: "Vacaciones con la familia",
    description: "Recargaste pilas lejos del teclado. +10 Mental, -10 Tilt, -20 Fatiga, -3 Aim.",
    apply: (c) => {
      const character = {
        ...c,
        stats: { ...c.stats, mental: clamp(c.stats.mental + 10), aim: clamp(c.stats.aim - 3) },
        tilt: clamp(c.tilt - 10),
        fatigue: clamp(c.fatigue - 20)
      };
      return { character, log: "Vacaciones con la familia. +10 Mental, -10 Tilt, -20 Fatiga, -3 Aim (te desentrenaste un poco)." };
    }
  }
];

export function pickPreseasonCards(count = 3): PreseasonCard[] {
  const shuffled = [...PRESEASON_CARD_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ------------------------------------------------------------
// Apertura de cajas — reemplaza la vieja elección "comprar o
// ahorrar". Tras un torneo importante podés abrir un contenedor
// con probabilidades reales de rareza, como en el juego de verdad.
// ------------------------------------------------------------
const RARITY_ODDS: { rarity: SkinItem["rarity"]; chance: number }[] = [
  { rarity: "Mil-Spec", chance: 0.4 },
  { rarity: "Restricted", chance: 0.28 },
  { rarity: "Classified", chance: 0.18 },
  { rarity: "Covert", chance: 0.11 },
  { rarity: "Contraband", chance: 0.03 }
];

export function openCase(): SkinItem {
  const roll = Math.random();
  let acc = 0;
  let targetRarity: SkinItem["rarity"] = "Mil-Spec";
  for (const bracket of RARITY_ODDS) {
    acc += bracket.chance;
    if (roll <= acc) {
      targetRarity = bracket.rarity;
      break;
    }
  }
  const pool = SHOP_ITEMS.filter((i) => i.rarity === targetRarity);
  const chosen = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : SHOP_ITEMS[0];
  return chosen;
}

// ------------------------------------------------------------
// Logros — dan feedback inmediato de progreso y quedan
// exhibidos como badges en el Dashboard.
// ------------------------------------------------------------
export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_win: { id: "first_win", label: "Primera Victoria", description: "Ganaste tu primer partido oficial." },
  faceit_level_10: { id: "faceit_level_10", label: "Nivel 10 de FACEIT", description: "Llegaste al Nivel 10, el techo del ELO de FACEIT." },
  first_contract: { id: "first_contract", label: "Primer Contrato", description: "Firmaste tu primer contrato profesional." },
  tier1_arrival: { id: "tier1_arrival", label: "Llegada al Tier 1", description: "Fichaste por un equipo de Tier 1 mundial." },
  major_qualified: { id: "major_qualified", label: "Clasificado al Major", description: "Tu equipo clasificó al CS2 Major." },
  major_champion: { id: "major_champion", label: "Campeón del Major", description: "Levantaste el trofeo del CS2 Major." },
  hltv_star: { id: "hltv_star", label: "Rating de Estrella", description: "Alcanzaste un HLTV Rating histórico mayor a 1.20." },
  fan_favorite: { id: "fan_favorite", label: "Ídolo de la Hinchada", description: "Superaste los 80 puntos de Hinchada (fans)." },
  survived_bench: { id: "survived_bench", label: "Remontada desde el Banco", description: "Volviste a ser titular después de estar en el banco de suplentes." },
  rich_list: { id: "rich_list", label: "Cuenta Bancaria Sana", description: "Acumulaste más de $50.000 en tu carrera." }
};

export function checkAchievements(character: Character, extra: { justUnbenched?: boolean } = {}): { character: Character; log: string[] } {
  const unlocked = new Set(character.achievements);
  const log: string[] = [];

  function unlock(id: string) {
    if (unlocked.has(id)) return;
    unlocked.add(id);
    log.push(`🏅 Logro desbloqueado: ${ACHIEVEMENTS[id].label} — ${ACHIEVEMENTS[id].description}`);
  }

  if (character.careerStats.matchesWon >= 1) unlock("first_win");
  if (computeFaceitLevel(character.faceitElo) >= 10) unlock("faceit_level_10");
  if (character.contract) unlock("first_contract");
  if (character.team?.tier === "tier1") unlock("tier1_arrival");
  if (character.titles.some((t) => t.includes("Major"))) unlock("major_champion");
  if (character.hltvRating >= 1.2 && character.careerStats.matchesPlayed >= 10) unlock("hltv_star");
  if (character.fans >= 80) unlock("fan_favorite");
  if (extra.justUnbenched) unlock("survived_bench");
  if (character.money.usd >= 50000) unlock("rich_list");

  if (unlocked.size === character.achievements.length) return { character, log: [] };
  return { character: { ...character, achievements: Array.from(unlocked) }, log };
}

// ------------------------------------------------------------
// Comparación final con una leyenda real del CS2, según el
// puntaje de carrera acumulado (títulos, rating, prize money).
// ------------------------------------------------------------
export function computeLegendComparison(character: Character): LegendComparison {
  const score =
    character.titles.length * 100 +
    character.hltvRating * 40 +
    character.careerStats.prizeMoneyUsd / 2000 +
    character.fans * 0.5;

  if (character.titles.some((t) => t.includes("Major")) && score >= 250) {
    return {
      tierLabel: "Leyenda GOAT",
      legendName: "s1mple / ZywOo",
      blurb: "Tu nombre queda tallado en la historia del CS. Múltiples Majors, un HLTV Rating brutal y una hinchada que te sigue a cualquier lado. Estás en la conversación de mejor jugador de la historia."
    };
  }
  if (score >= 150) {
    return {
      tierLabel: "Superestrella Tier 1",
      legendName: "NiKo / device",
      blurb: "Carrera de elite mundial. Peleaste finales de Major, ganaste plata en serio y tu nombre se respeta en cualquier scrim del Tier 1."
    };
  }
  if (score >= 80) {
    return {
      tierLabel: "Profesional consolidado",
      legendName: "un titular de un top-15 mundial",
      blurb: "Viviste del CS varios años, jugaste contra los mejores del mundo y dejaste tu marca en la escena. No todos pueden decir lo mismo."
    };
  }
  if (score >= 30) {
    return {
      tierLabel: "Profesional regional",
      legendName: "una figura histórica de tu escena local",
      blurb: "Te ganaste un lugar en la escena de tu región. Quizás no llegaste al Major, pero cualquier pibe que arranca hoy te conoce."
    };
  }
  return {
    tierLabel: "El sueño del pibe",
    legendName: "un jugador de FACEIT con historia para contar",
    blurb: "No llegaste a la cima, pero jugaste, la peleaste y viviste el camino. La escena está llena de historias como la tuya — y eso también vale."
  };
}
