import { Character, MatchResult, PressPost } from "./types";

// ============================================================
// Redes & Prensa — feed dinámico estilo Twitter/X + HLTV,
// con comentarios de hinchas, hinchas brasileños y casters,
// generado a partir del resultado del último partido.
// ============================================================

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const FAN_HANDLES = ["elpibedeltrade", "csgo_forever_ar", "quiero1major", "tilteado_pro", "hinchaderetake", "faceit_addict"];
const BR_FAN_HANDLES = ["furiaflamengo1", "brcsfan99", "cheguei_furioso", "sp_1080p", "pain_forever_br"];
const CASTER_NAMES = ["Kariver", "MalditoNoob (caster)", "Zeekout Analytics", "HLTV Confirmed", "Desk analyst SA"];
const PRESS_OUTLETS = ["Dust2.com.br", "CS Report LATAM", "Bomba Defusada", "GG Radar"];

function winFanComments(nickname: string, team: string): string[] {
  return [
    `no puedo creer lo que hizo ${nickname} en ese último round, TREMENDO`,
    `${team} rompiéndola de nuevo, vamos que se puede`,
    `${nickname} cargando al equipo en el momento justo. Que crack`,
    `esto es historia, guardénlo`,
    `alguien que le avise a las orgas grandes que ${nickname} está para más`
  ];
}

function loseFanComments(nickname: string, team: string): string[] {
  return [
    `${nickname} sobrevalorado, solo pega contra Tier 3`,
    `otra vez la misma historia con ${team}... hasta cuándo`,
    `necesitan un IGL nuevo urgente, se nota en la lectura del mapa`,
    `bueno, a levantarse para la próxima. Así es esto`,
    `el roster no da para más, alguien tiene que salir`
  ];
}

function brFanComments(won: boolean, nickname: string): string[] {
  if (won) {
    return [
      `o pibe é muito bom, respeito total`,
      `nossa, ${nickname} jogou igual um monstro hoje`,
      `admito, joga bem esse argentino`
    ];
  }
  return [
    `o pibe é muito fraco, sabia que ia perder`,
    `sul-americano bom só tem no Brasil, aceita`,
    `pra que time contratou esse cara mesmo?`
  ];
}

function casterQuotes(won: boolean, nickname: string, rating: number): string[] {
  if (won) {
    return [
      `Análisis rápido: ${nickname} cerró el mapa con un rating de ${rating.toFixed(2)}. Números de Tier 1, ojo.`,
      `Ese último clutch de ${nickname} va a los highlights del mes, sin dudas.`,
      `Lo que mostró ${nickname} hoy es la evolución de un jugador que viene escalando escalón por escalón.`
    ];
  }
  return [
    `${nickname} con un rating de ${rating.toFixed(2)} hoy — partido para el olvido, hay que dar vuelta la página rápido.`,
    `Se nota la presión en el juego de ${nickname}. Los próximos partidos van a ser clave para la confianza.`,
    `Día flojo, pero la proyección a mediano plazo de ${nickname} sigue intacta.`
  ];
}

function pressHeadlines(won: boolean, nickname: string, team: string, opponent: string): string[] {
  if (won) {
    return [
      `${team} da la sorpresa y vence a ${opponent}: la actuación de ${nickname}, el punto más alto`,
      `Con un ${nickname} inspirado, ${team} suma una victoria clave en la temporada`
    ];
  }
  return [
    `${team} cae ante ${opponent} en un partido para el olvido`,
    `Otra derrota para ${team}: la organización empieza a mirar el mercado de pases`
  ];
}

export function generatePressFeed(character: Character, result: MatchResult): PressPost[] {
  const posts: PressPost[] = [];
  const teamName = character.team?.name ?? "Free Agent";
  const count = rand(2, 4);

  const pools: Array<() => PressPost> = [
    () => {
      const pool = result.won ? winFanComments(character.nickname, teamName) : loseFanComments(character.nickname, teamName);
      const handle = FAN_HANDLES[rand(0, FAN_HANDLES.length - 1)];
      return { id: `${Date.now()}-${Math.random()}`, author: handle, handle: `@${handle}`, text: pool[rand(0, pool.length - 1)], kind: "fan" };
    },
    () => {
      const pool = brFanComments(result.won, character.nickname);
      const handle = BR_FAN_HANDLES[rand(0, BR_FAN_HANDLES.length - 1)];
      return { id: `${Date.now()}-${Math.random()}`, author: handle, handle: `@${handle}`, text: pool[rand(0, pool.length - 1)], kind: "br_fan" };
    },
    () => {
      const pool = casterQuotes(result.won, character.nickname, result.rating);
      const name = CASTER_NAMES[rand(0, CASTER_NAMES.length - 1)];
      return { id: `${Date.now()}-${Math.random()}`, author: name, handle: "Desk / Cast", text: pool[rand(0, pool.length - 1)], kind: "caster" };
    },
    () => {
      const pool = pressHeadlines(result.won, character.nickname, teamName, result.opponent);
      const outlet = PRESS_OUTLETS[rand(0, PRESS_OUTLETS.length - 1)];
      return { id: `${Date.now()}-${Math.random()}`, author: outlet, handle: "Prensa", text: pool[rand(0, pool.length - 1)], kind: "press" };
    }
  ];

  const shuffled = [...pools].sort(() => Math.random() - 0.5);
  for (let i = 0; i < count; i++) {
    posts.push(shuffled[i % shuffled.length]());
  }
  return posts;
}
