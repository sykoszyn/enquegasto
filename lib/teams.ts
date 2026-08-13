import { Region, Team, TeamTier } from "./types";

// ============================================================
// Equipos de la escena CS2 — temporada 2026, organizados por
// región elegida por el jugador y por tier de competitividad.
// Basado en la escena real (rosters aproximados a mediados de 2026).
// `primaryColor` es solo un acento de color para el "escudo" de
// iniciales en la UI — no usamos logos ni imágenes reales.
// ============================================================

// ------------------------------------------------------------
// SUDAMÉRICA
// ------------------------------------------------------------
const SA_LOCAL: Team[] = [
  {
    id: "rtt100",
    name: "RTT100",
    tier: "local",
    region: "SA",
    roster: ["NikoM", "Straka", "FRANAR", "bichop", "un pibe de FPL-C"],
    description:
      "La organización más querida (y más memeada) de la comunidad argentina. Fichar acá es entrar directo a los streams de la escena y a la presión de los hinchas que viven pegados al Discord.",
    primaryColor: "#e11d48"
  },
  {
    id: "9z_academy",
    name: "9z Academy",
    tier: "local",
    region: "SA",
    roster: ["prospecto de la Academy", "un lurker con potencial", "un IGL en formación"],
    description:
      "La cantera de 9z Team, el histórico argentino. Entrar acá es la antesala directa al primer equipo si mostrás nivel.",
    primaryColor: "#2563eb"
  },
  {
    id: "fireconter_local",
    name: "FiReCONTER Local",
    tier: "local",
    region: "SA",
    roster: ["un pibe de qualifier", "un support amateur", "un AWP casero"],
    description:
      "Un roster amateur armado para el circuito FiReCONTER en el BIG de Barracas, Buenos Aires. Presupuesto: cero. Ganas de romperla: todas.",
    primaryColor: "#f97316"
  },
  {
    id: "malvinas_gaming",
    name: "Malvinas Gaming",
    tier: "local",
    region: "SA",
    roster: ["un rifler de La Plata", "un entry de Mar del Plata", "un support cordobés"],
    description:
      "Proyecto amateur con identidad bien federal: jugadores de todo el interior del país peleando un lugar en la escena de Buenos Aires.",
    primaryColor: "#0ea5e9"
  }
];

const SA_TIER2: Team[] = [
  { id: "bestia", name: "Bestia", tier: "tier2", region: "SA", roster: ["Noktse", "BUDA", "cass1n", "tomaszin", "timo"], description: "Campeón reciente en Draculán (Europa) y en ascenso en el ranking Valve. Disciplina táctica y hambre de Major.", primaryColor: "#7c2d12" },
  { id: "9z", name: "9z Team", tier: "tier2", region: "SA", roster: ["dgt", "atarax1a", "fraguty", "Hezz", "dott1"], description: "El histórico argentino. Con dgt de vuelta y un 3º puesto reciente en Circuit X (Brasil), buscan volver a ser protagonistas.", primaryColor: "#2563eb" },
  { id: "legacy", name: "Legacy", tier: "tier2", region: "SA", roster: ["yuurih jr.", "kauez", "ntz", "MarKE", "havoc"], description: "Uno de los proyectos brasileños más sólidos, con buen historial reciente contra europeos de segunda fila.", primaryColor: "#000000" },
  { id: "pain", name: "paiN Gaming", tier: "tier2", region: "SA", roster: ["snow", "biguzera", "kNgV-", "nqz", "havoc"], description: "Organización brasileña tradicional. Mezcla veteranos con caras nuevas tras los ajustes de inicios de 2026.", primaryColor: "#facc15" },
  { id: "mibr", name: "MIBR", tier: "tier2", region: "SA", roster: ["exit", "malbsMd", "artzin", "insani", "roxxy"], description: "El nombre más pesado de la historia sudamericana, con toda la presión que eso implica. Clasificados al Stage 2 del Major de Cologne.", primaryColor: "#1d4ed8" },
  { id: "imperial", name: "Imperial Esports", tier: "tier2", region: "SA", roster: ["fnx", "duda", "chayJESUS", "Shr", "roxxy"], description: "Organización brasileña con historial de haber vencido a Vitality en un Major. Siempre peleando el título regional.", primaryColor: "#16a34a" },
  { id: "kru", name: "KRÜ Esports", tier: "tier2", region: "SA", roster: ["atarax1a jr.", "Insani", "havoc jr."], description: "El histórico argentino-brasileño, con mística de haber tocado el Tier 1 mundial.", primaryColor: "#dc2626" },
  { id: "fluxo", name: "Fluxo", tier: "tier2", region: "SA", roster: ["chayJESUS jr.", "yeL", "VSM"], description: "Roster brasileño joven y agresivo, entry fraggers que no le tienen miedo a nada.", primaryColor: "#a855f7" },
  { id: "oddik", name: "ODDIK", tier: "tier2", region: "SA", roster: ["nak", "dumau", "b0ies", "lucaozy", "vsm jr."], description: "Proyecto brasileño de recambio generacional, con jugadores muy jóvenes y mucha proyección.", primaryColor: "#059669" },
  { id: "redcanids", name: "RED Canids", tier: "tier2", region: "SA", roster: ["biguzera jr.", "kaike", "yuurih jr. 2", "trk", "skullz"], description: "Organización histórica brasileña de esports, con un roster de CS2 en plena reconstrucción.", primaryColor: "#b91c1c" }
];

const SA_TIER1: Team[] = [
  { id: "furia", name: "FURIA Esports", tier: "tier1", region: "SA", roster: ["FalleN", "yuurih", "YEKINDAR", "KSCERATO", "molodoy"], description: "El proyecto sudamericano de elite: apuesta internacional con YEKINDAR y molodoy que combina la agresión brasileña con estructura europea. Top mundial.", primaryColor: "#000000" }
];

// ------------------------------------------------------------
// NORTEAMÉRICA
// ------------------------------------------------------------
const NA_LOCAL: Team[] = [
  { id: "na_collegiate", name: "Collegiate Circuit", tier: "local", region: "NA", roster: ["un pibe de universidad", "un rifler part-time", "un IGL de discord de campus"], description: "El circuito universitario/colegial de Norteamérica. Torneos online, becas en juego y mucho ping variable según el server.", primaryColor: "#1d4ed8" },
  { id: "na_open_qual", name: "NA Open Qualifier Crew", tier: "local", region: "NA", roster: ["un FPS enjoyer random", "un flex player", "un support de ESEA Open"], description: "Un roster amateur armado para pelear las qualifiers abiertas de ESEA. Sin sponsor, con ganas.", primaryColor: "#ea580c" },
  { id: "na_frostbyte", name: "Frostbyte Amateurs", tier: "local", region: "NA", roster: ["un aimer de Toronto", "un support de Chicago", "un IGL de Seattle"], description: "Equipo amateur canadiense-estadounidense armado en Discord, peleando desde cero en las qualifiers abiertas.", primaryColor: "#0891b2" }
];

const NA_TIER2: Team[] = [
  { id: "complexity", name: "Complexity Gaming", tier: "tier2", region: "NA", roster: ["FaNg", "JT", "Grim jr.", "Xeppaa jr.", "Junior"], description: "Organización histórica de Norteamérica, en busca de recuperar terreno perdido.", primaryColor: "#f97316" },
  { id: "evilgeniuses", name: "Evil Geniuses", tier: "tier2", region: "NA", roster: ["Ex3rcice", "Malbryte", "supreme", "IceBerg", "Boombl4 jr."], description: "Uno de los proyectos más ambiciosos de la región, buscando volver a pelear arriba.", primaryColor: "#1e293b" },
  { id: "nrg", name: "NRG Esports", tier: "tier2", region: "NA", roster: ["FNS jr.", "jks jr.", "Ex3rcice jr.", "Brehze jr.", "CeRq jr."], description: "Organización con recursos e infraestructura de primer nivel, todavía construyendo su roster ideal.", primaryColor: "#0f172a" },
  { id: "optic", name: "OpTic Gaming", tier: "tier2", region: "NA", roster: ["dephh", "malbsMd jr.", "Brehze", "FaNg jr."], description: "La marca verde vuelve a apostar fuerte al Counter-Strike tras años en otros títulos.", primaryColor: "#22c55e" },
  { id: "m80", name: "M80", tier: "tier2", region: "NA", roster: ["reck", "Brehze jr. 2", "Fessor", "Sonic", "Snoodie"], description: "Uno de los proyectos norteamericanos más en forma de los últimos tiempos, con juego agresivo y consistente.", primaryColor: "#dc2626" },
  { id: "partyastronauts", name: "Party Astronauts", tier: "tier2", region: "NA", roster: ["daps jr.", "Wicadia jr. 2", "yay jr.", "Kaze"], description: "Proyecto joven de la escena norteamericana, con mucho apoyo de contenido y comunidad en redes.", primaryColor: "#7c3aed" }
];

const NA_TIER1: Team[] = [
  { id: "liquid", name: "Team Liquid", tier: "tier1", region: "NA", roster: ["NAF", "oSee", "Grim", "YEKINDAR jr.", "Twistzz jr."], description: "El proyecto norteamericano más consistente de la era CS2, referente de la región en el Tier 1 mundial.", primaryColor: "#0ea5b7" }
];

// ------------------------------------------------------------
// EUROPA
// ------------------------------------------------------------
const EU_LOCAL: Team[] = [
  { id: "eu_academy", name: "Academy Circuit EU", tier: "local", region: "EU", roster: ["prospecto nórdico", "un IGL polaco", "un AWP báltico"], description: "El circuito de academias europeas: la cantera más profunda y competitiva del mundo. Acá cualquier error te saca del roster.", primaryColor: "#334155" },
  { id: "eu_esea_open", name: "ESEA Open EU", tier: "local", region: "EU", roster: ["un rifler alemán", "un support francés", "un lurker danés"], description: "Qualifiers abiertas europeas: cientos de equipos peleando por un puñado de lugares en Tier 3.", primaryColor: "#475569" },
  { id: "eu_riftbreakers", name: "Riftbreakers", tier: "local", region: "EU", roster: ["un aimer español", "un IGL italiano", "un support griego"], description: "Proyecto amateur del sur de Europa, con presupuesto ajustado pero muy buena mecánica individual.", primaryColor: "#0d9488" }
];

const EU_TIER2: Team[] = [
  { id: "saw", name: "SAW", tier: "tier2", region: "EU", roster: ["Shr jr.", "roxxy jr.", "b4rtiN", "ETO jr.", "Dias"], description: "Organización portuguesa en ascenso, conocida por su disciplina táctica.", primaryColor: "#dc2626" },
  { id: "eternalfire", name: "Eternal Fire", tier: "tier2", region: "EU", roster: ["MAJ3R", "xataX", "XANTARES jr.", "Wicadia", "woxic jr."], description: "El proyecto turco de referencia, con una hinchada gigante y mucha presión mediática.", primaryColor: "#b91c1c" },
  { id: "gamerlegion", name: "GamerLegion", tier: "tier2", region: "EU", roster: ["ottoNd", "keev1n", "nexa jr.", "Tauson jr."], description: "Roster nórdico sólido, especialistas en robar puntos a equipos top en LAN.", primaryColor: "#facc15" },
  { id: "og", name: "OG", tier: "tier2", region: "EU", roster: ["NiKo jr.", "flameZ jr.", "jL jr.", "iM jr."], description: "Organización histórica reconstruyéndose, con jugadores jóvenes de mucho talento.", primaryColor: "#22d3ee" },
  { id: "bigclan", name: "BIG", tier: "tier2", region: "EU", roster: ["tabseN", "syrsoN", "k1to jr.", "shalfey"], description: "El proyecto alemán de siempre: identidad fuerte, resultados irregulares.", primaryColor: "#0f172a" },
  { id: "apeks", name: "Apeks", tier: "tier2", region: "EU", roster: ["djL jr.", "Tomillio", "sl3nd", "Tauson"], description: "Roster escandinavo prolijo, siempre cerca de dar el batacazo.", primaryColor: "#4338ca" },
  { id: "sinners", name: "Sinners Esports", tier: "tier2", region: "EU", roster: ["kyxsan jr.", "kyuubii", "gxx-", "nawwk jr."], description: "Proyecto checo/nórdico en ascenso, con buenos resultados en Europa Central.", primaryColor: "#9f1239" },
  { id: "ninjasinpyjamas", name: "Ninjas in Pyjamas", tier: "tier2", region: "EU", roster: ["hoody", "headtr1ck", "plopski", "Snappi jr.", "REZ"], description: "Organización sueca histórica, reconstruyendo su identidad tras años irregulares.", primaryColor: "#facc15" }
];

const EU_TIER1: Team[] = [
  { id: "vitality", name: "Team Vitality", tier: "tier1", region: "EU", roster: ["ZywOo", "ropz", "apEX", "flameZ", "mezii"], description: "El mejor equipo del mundo en 2026. Bicampeones de Major. Un bootcamp acá te cambia la carrera para siempre.", primaryColor: "#fbbf24" },
  { id: "mouz", name: "MOUZ", tier: "tier1", region: "EU", roster: ["torzsi", "xertioN", "Jimpphat", "Spinx jr.", "Brollan"], description: "Ascenso meteórico con una mezcla de talento joven europeo y experiencia nórdica.", primaryColor: "#dc2626" },
  { id: "falcons", name: "Team Falcons", tier: "tier1", region: "EU", roster: ["m0NESY", "Rain", "flameZ jr.", "kyxsan", "sl3nd jr."], description: "El proyecto saudí con presupuesto ilimitado y estrellas de todo el mundo. Top 5 global.", primaryColor: "#059669" },
  { id: "navi", name: "Natus Vincere", tier: "tier1", region: "EU", roster: ["b1t", "iM", "jL", "w0nderful jr.", "Aleksib"], description: "Historia viva del competitivo, con una hinchada gigante y la presión de estar siempre arriba.", primaryColor: "#facc15" },
  { id: "spirit", name: "Team Spirit", tier: "tier1", region: "EU", roster: ["donk", "chopper", "sh1ro", "zont1x", "magixx"], description: "La nueva generación rusa, agresiva y sin techo. Líderes del ranking en 2026.", primaryColor: "#f8fafc" },
  { id: "betboom", name: "BetBoom Team", tier: "tier1", region: "EU", roster: ["buster", "iDISBALANCE", "Jerry", "n0rb3r7", "Wicadia jr."], description: "Uno de los proyectos más en forma del año, con un win rate altísimo en los últimos meses.", primaryColor: "#ea580c" },
  { id: "aurora", name: "Aurora Gaming", tier: "tier1", region: "EU", roster: ["woxic", "XANTARES", "techno4k", "jL jr.", "k0nfig jr."], description: "El proyecto turco/nórdico que dio el batacazo grande: campeones de Major en 2025.", primaryColor: "#0ea5e9" },
  { id: "astralis", name: "Astralis", tier: "tier1", region: "EU", roster: ["device", "staehr", "jabbi", "TeSeS", "Farlig"], description: "La organización danesa en plena reconstrucción, todavía peligrosa en cualquier LAN.", primaryColor: "#dc2626" },
  { id: "g2", name: "G2 Esports", tier: "tier1", region: "EU", roster: ["NiKo", "m0NESY jr.", "HooXi", "huNter-", "nexa"], description: "Talento crudo y una IGL que arma sistemas complejos. Siempre entre los mejores del mundo.", primaryColor: "#0f172a" },
  { id: "faze", name: "FaZe Clan", tier: "tier1", region: "EU", roster: ["karrigan", "broky", "frozen", "Twistzz", "EliGE"], description: "Estrellas mediáticas y calidad de Major. La organización más reconocible del CS mundial.", primaryColor: "#dc2626" },
  { id: "mongolz", name: "The MongolZ", tier: "tier1", region: "EU", roster: ["910", "Senzu", "Techno", "bLitz", "Mzinho"], description: "La sorpresa asiática que se instaló entre los mejores del mundo con un estilo agresivo y particular.", primaryColor: "#f97316" }
];

export const ALL_TEAMS: Team[] = [
  ...SA_LOCAL, ...SA_TIER2, ...SA_TIER1,
  ...NA_LOCAL, ...NA_TIER2, ...NA_TIER1,
  ...EU_LOCAL, ...EU_TIER2, ...EU_TIER1
];

const TEAMS_BY_REGION: Record<Region, Record<TeamTier, Team[]>> = {
  SA: { local: SA_LOCAL, tier2: SA_TIER2, tier1: SA_TIER1 },
  NA: { local: NA_LOCAL, tier2: NA_TIER2, tier1: NA_TIER1 },
  EU: { local: EU_LOCAL, tier2: EU_TIER2, tier1: EU_TIER1 }
};

// El pool mundial de Tier 1 (usado para el salto a Europa / el Major)
// es compartido: no importa de qué región vengas, el techo del deporte
// es el mismo. Se arma con los mejores equipos de las tres regiones.
export const WORLD_TIER1_TEAMS: Team[] = [...EU_TIER1, ...SA_TIER1, ...NA_TIER1];

export function teamsForPhase(phase: string, region: Region): Team[] {
  switch (phase) {
    case "tier3":
      return TEAMS_BY_REGION[region].local;
    case "tier2":
      return TEAMS_BY_REGION[region].tier2;
    case "tier1":
    case "major":
      return WORLD_TIER1_TEAMS;
    default:
      return [];
  }
}

export const REGION_LABELS: Record<Region, string> = {
  SA: "Sudamérica",
  NA: "Norteamérica",
  EU: "Europa"
};

// Nombres de fantasía para generar el rival (NPC) según región
const RIVAL_NAME_POOLS: Record<Region, string[]> = {
  SA: ["elpibedelretake", "chapuXD", "chetoDeBahia", "faca_fantasma", "quilmerobot", "riverplateAWP"],
  NA: ["xFragzy", "MaverickNA", "TexasHeat", "CoastalClutch", "OhioOverpass", "DesertEagle_"],
  EU: ["FrostbiteEU", "SwedishSteel", "BerlinRifler", "NordicNoScope", "IronCurtainAim", "LisbonLurk"]
};

export function generateRivalName(region: Region): string {
  const pool = RIVAL_NAME_POOLS[region];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ------------------------------------------------------------
// Rivales de la fase FACEIT (Niveles 1-10): no existen equipos
// fijos reales en este nivel (es matchmaking/pug real), así que
// generamos escuadras de mix con nombres creíbles según nivel y
// región — esto reemplaza al bug del "rival genérico".
// ------------------------------------------------------------
const FACEIT_MIX_PREFIXES: Record<Region, string[]> = {
  SA: ["Mix de Discord", "Quinteto de la Q", "Pug de Rosario", "Los Pibes del Server BR", "Stack de FPL-C", "Mix de Palermo", "Los Chetos de Nivel"],
  NA: ["Discord Stack", "Random Fireteam", "Placement Squad", "The Basement Five", "Late Night Pug", "Ranked Grinders"],
  EU: ["Random Mix EU", "Placement Stack", "5-Stack Nórdico", "Pug Berlinés", "Late Server Crew", "ELO Hunters"]
};

export function generateFaceitOpponentName(region: Region, level: number): string {
  const pool = FACEIT_MIX_PREFIXES[region];
  const prefix = pool[Math.floor(Math.random() * pool.length)];
  return `${prefix} (Nivel ${level})`;
}
