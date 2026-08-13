import { Character, GameEvent } from "./types";
import { openCase } from "./gameEngine";

// ============================================================
// Eventos narrativos — cultura CS2 global, con foco fuerte en
// la escena argentina/sudamericana pero con contenido propio
// para Norteamérica y Europa según la región elegida.
// Cada evento aplica un efecto sobre stats, mental, tilt, plata, fans, etc.
// ============================================================

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

const isSA = (c: Character) => c.region === "SA";
const isNA = (c: Character) => c.region === "NA";
const isEU = (c: Character) => c.region === "EU";

export const EVENTS: GameEvent[] = [
  // ---------------------------------------------------------
  // Eventos generales (cualquier región)
  // ---------------------------------------------------------
  {
    id: "ping_alto",
    phase: "faceit",
    title: "Ping alto contra el server equivocado",
    description:
      "Te toca jugar una pug importante en un server lejano. Vos tenés 60ms, el resto juega con 5ms. Un rusheador te agarra doblado en un ángulo que ni viste venir.",
    choices: [
      {
        label: "Bancarte el ping y jugar más pasivo",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, mental: clamp(c.stats.mental + 2) } };
          return { character, log: "Aprendiste a jugar con desventaja de ping. +2 Mental." };
        }
      },
      {
        label: "Tiltear y mandar fruta en el chat de voz",
        apply: (c) => {
          const character = { ...c, tilt: clamp(c.tilt + 15), form: clamp(c.form - 10, -100, 100) };
          return { character, log: "Te fuiste al pasto en el chat de voz. +15 Tilt, -10 Forma." };
        }
      }
    ]
  },
  {
    id: "trasnoche_discord",
    phase: "faceit",
    title: "Humo hasta las 5 AM",
    description:
      "El grupo de Discord se prende con una scrim informal que termina en pugs hasta las 5 de la mañana. Mañana tenés clase/laburo, pero el squad está on fire.",
    choices: [
      {
        label: "Quedarte jugando toda la noche",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, aim: clamp(c.stats.aim + 3) }, tilt: clamp(c.tilt + 8) };
          return { character, log: "Subiste el aim a fuerza de trasnoche, pero el cuerpo lo empieza a facturar. +3 Aim, +8 Tilt." };
        }
      },
      {
        label: "Irte a dormir temprano como un profesional",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, mental: clamp(c.stats.mental + 3) }, tilt: clamp(c.tilt - 5) };
          return { character, log: "Priorizaste el descanso. +3 Mental, -5 Tilt." };
        }
      }
    ]
  },
  {
    id: "bardeo_twitter",
    phase: "tier2",
    title: "Bardeo en Twitter/X",
    description:
      "Después de una derrota fea, un ex compañero te tira un palito pasivo-agresivo en Twitter/X. Los replies ya se están llenando de gente picando el boleto.",
    choices: [
      {
        label: "Contestar fuerte y armar el numerito",
        apply: (c) => {
          const character = {
            ...c,
            reputation: clamp(c.reputation + 8),
            fans: clamp(c.fans + 6),
            stats: { ...c.stats, mental: clamp(c.stats.mental - 5) }
          };
          return { character, log: "El numerito se hizo viral. +8 Reputación, +6 Hinchada, -5 Mental." };
        }
      },
      {
        label: "No entrar en el juego y enfocarte en entrenar",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, aim: clamp(c.stats.aim + 2), mental: clamp(c.stats.mental + 2) } };
          return { character, log: "Canalizaste la bronca en la práctica. +2 Aim, +2 Mental." };
        }
      }
    ]
  },
  {
    id: "case_opening",
    phase: "any",
    title: "Caja del torneo",
    description:
      "El torneo reparte una caja conmemorativa a todos los que compitieron. Podés abrirla ahí mismo frente a tus compañeros, o venderla cerrada por unos dólares seguros en el mercado.",
    choices: [
      {
        label: "Abrirla ahora mismo",
        apply: (c) => {
          const item = openCase();
          const character = {
            ...c,
            inventory: [...c.inventory, item],
            form: clamp(c.form + item.confidenceBoost, -100, 100)
          };
          const rarityShout =
            item.rarity === "Covert" || item.rarity === "Contraband"
              ? "¡¡DROP DE LUJO!! Todo el Discord se prendió fuego con tu drop."
              : "Un drop discreto, pero es tuyo.";
          return {
            character,
            log: `Abrís la caja... sale ${item.name} (${item.rarity}). ${rarityShout} +${item.confidenceBoost} Forma.`
          };
        }
      },
      {
        label: "Venderla cerrada por plata segura",
        apply: (c) => {
          const amount = 15 + Math.floor(Math.random() * 30);
          const character = { ...c, money: { ...c.money, usd: c.money.usd + amount } };
          return { character, log: `Vendiste la caja sin abrir por $${amount}. Nada de drama, plata segura.` };
        }
      }
    ]
  },
  {
    id: "sponsor_energetica",
    phase: "tier2",
    title: "Propuesta de una marca de energizantes",
    description:
      "Una marca de bebidas energéticas te ofrece ser imagen regional: publicaciones patrocinadas, un logo nuevo en tu jersey y plata garantizada por seis meses.",
    choices: [
      {
        label: "Firmar el auspicio",
        apply: (c) => {
          const character = { ...c, money: { ...c.money, usd: c.money.usd + 450 }, fans: clamp(c.fans + 6) };
          return { character, log: "Firmaste con la marca de energizantes. +$450, +6 Hinchada." };
        }
      },
      {
        label: "Rechazarlo, no tomás esas cosas",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, mental: clamp(c.stats.mental + 2) } };
          return { character, log: "Preferiste no atarte a un sponsor. +2 Mental (menos presión encima)." };
        }
      }
    ]
  },
  {
    id: "acusacion_trampas",
    phase: "tier2",
    title: "Te acusan de hacer trampa en un stream",
    description:
      "Después de un partido con un highlight increíble, empiezan a circular capturas raras de tu POV en redes acusándote de cheatear. Nunca hiciste nada, pero el ruido es fuerte.",
    choices: [
      {
        label: "Pedir una revisión pública de tu POV",
        apply: (c) => {
          const character = { ...c, reputation: clamp(c.reputation + 6), tilt: clamp(c.tilt + 5) };
          return { character, log: "La revisión te limpió el nombre públicamente. +6 Reputación, +5 Tilt (fue estresante)." };
        }
      },
      {
        label: "Ignorar el ruido y seguir jugando",
        apply: (c) => {
          const character = { ...c, fans: clamp(c.fans - 3), stats: { ...c.stats, mental: clamp(c.stats.mental + 3) } };
          return { character, log: "Dejaste que el tema se apague solo. -3 Hinchada, +3 Mental." };
        }
      }
    ]
  },
  {
    id: "meet_and_greet",
    phase: "tier1",
    title: "Meet & greet con la hinchada",
    description: "Antes de un torneo grande, la organización arma un meet & greet para que los fans te conozcan en persona.",
    choices: [
      {
        label: "Quedarte todo el tiempo que haga falta",
        apply: (c) => {
          const character = { ...c, fans: clamp(c.fans + 10), fatigue: clamp(c.fatigue + 8) };
          return { character, log: "Te quedaste hasta el final firmando cosas. +10 Hinchada, +8 Fatiga." };
        }
      },
      {
        label: "Pasar rápido y guardar energía para el torneo",
        apply: (c) => {
          const character = { ...c, fatigue: clamp(c.fatigue - 3) };
          return { character, log: "Fuiste breve pero cordial. -3 Fatiga." };
        }
      }
    ]
  },
  {
    id: "primer_sponsor_personal",
    phase: "tier3",
    title: "Tu primer sponsor personal",
    description: "Una tienda de periféricos gamer local te ofrece mandarte gratis mouse, mousepad y teclado a cambio de que los muestres en tus redes.",
    once: true,
    choices: [
      {
        label: "Aceptar el combo gratis",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, aim: clamp(c.stats.aim + 2) }, fans: clamp(c.fans + 3) };
          return { character, log: "Nuevo setup gratis de tu primer sponsor. +2 Aim, +3 Hinchada." };
        }
      },
      {
        label: "Seguir con tu setup de siempre",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, mental: clamp(c.stats.mental + 2) } };
          return { character, log: "Preferiste no cambiar lo que ya te funciona. +2 Mental." };
        }
      }
    ]
  },
  {
    id: "problema_companero",
    phase: "tier2",
    title: "Un compañero se tiltea en pleno torneo",
    description:
      "Tu compañero de rifle arrancó el día con -8 y ya está mandando mensajes raros al grupo. El equipo necesita que alguien baje los decibeles antes del próximo mapa.",
    choices: [
      {
        label: "Hablar con él en privado y contenerlo",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, comm: clamp(c.stats.comm + 4) }, reputation: clamp(c.reputation + 3) };
          return { character, log: "Bajaste la tensión del grupo. +4 Comunicación, +3 Reputación." };
        }
      },
      {
        label: "Dejarlo pasar, no es tu problema",
        apply: (c) => {
          const character = { ...c, form: clamp(c.form - 5, -100, 100) };
          return { character, log: "El equipo quedó descoordinado para el próximo mapa. -5 Forma." };
        }
      }
    ]
  },
  {
    id: "lesion_muneca",
    phase: "tier1",
    title: "Dolor en la muñeca",
    description:
      "Después de meses de práctica sin parar, empezás a sentir un dolor raro en la muñeca del mouse. El equipo tiene un partido importante en dos semanas.",
    choices: [
      {
        label: "Jugar igual, apretar los dientes",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, aim: clamp(c.stats.aim - 4) }, tilt: clamp(c.tilt + 6) };
          return { character, log: "Jugaste lesionado. -4 Aim, +6 Tilt. El cuerpo pasa factura." };
        }
      },
      {
        label: "Parar una semana y tratarte con un kinesiólogo",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, mental: clamp(c.stats.mental + 3) }, reputation: clamp(c.reputation - 3) };
          return { character, log: "Te cuidaste a tiempo. +3 Mental, -3 Reputación (el equipo no estaba contento)." };
        }
      }
    ]
  },
  {
    id: "oferta_streaming",
    phase: "tier2",
    title: "Oferta para streamear",
    description:
      "Una plataforma te ofrece un contrato para streamear tus sesiones de práctica. Buena plata extra, pero te va a robar horas de descanso.",
    choices: [
      {
        label: "Aceptar el contrato de streaming",
        apply: (c) => {
          const character = { ...c, money: { ...c.money, usd: c.money.usd + 300 }, fans: clamp(c.fans + 8), tilt: clamp(c.tilt + 5) };
          return { character, log: "Firmaste el contrato de streaming. +$300, +8 Hinchada, +5 Tilt." };
        }
      },
      {
        label: "Rechazarlo y enfocarte 100% en competir",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, mental: clamp(c.stats.mental + 2) } };
          return { character, log: "Preferiste enfocarte en el juego. +2 Mental." };
        }
      }
    ]
  },
  {
    id: "final_reñida",
    phase: "tier1",
    title: "Final va a triple overtime",
    description:
      "Estás jugando la final de un torneo regional y el mapa se va a triple overtime. Todo el equipo está agotado mentalmente.",
    choices: [
      {
        label: "Sacar fuerzas de flaqueza y liderar el push final",
        apply: (c) => {
          const character = {
            ...c,
            stats: { ...c.stats, clutch: clamp(c.stats.clutch + 5) },
            reputation: clamp(c.reputation + 8),
            fans: clamp(c.fans + 10)
          };
          return { character, log: "Lideraste el OT decisivo. +5 Clutch, +8 Reputación, +10 Hinchada." };
        }
      },
      {
        label: "Jugar conservador y confiar en el equipo",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, comm: clamp(c.stats.comm + 4) } };
          return { character, log: "Confiaste en el sistema del equipo. +4 Comunicación." };
        }
      }
    ]
  },
  {
    id: "documental",
    phase: "tier1",
    once: true,
    title: "Te proponen un documental sobre tu carrera",
    description:
      "Una productora quiere filmar un documental sobre tu camino desde el barro de FACEIT hasta acá. Implica cámaras todo el día durante un mes.",
    choices: [
      {
        label: "Aceptar, total ya la remaste toda",
        apply: (c) => {
          const character = { ...c, fans: clamp(c.fans + 15), tilt: clamp(c.tilt + 6) };
          return { character, log: "El documental se estrenó y fue furor. +15 Hinchada, +6 Tilt (las cámaras cansan)." };
        }
      },
      {
        label: "Rechazarlo para no perder el foco",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, mental: clamp(c.stats.mental + 3) } };
          return { character, log: "Preferiste mantener la rutina sin distracciones. +3 Mental." };
        }
      }
    ]
  },

  {
    id: "pelea_por_awp",
    phase: "tier2",
    title: "Pelea por quién agarra la AWP",
    description:
      "Vos y un compañero se quieren matar (metafóricamente) por quién se queda con la AWP esta ronda de prácticas. El IGL no quiere meterse.",
    condition: (c) => c.team !== null,
    choices: [
      {
        label: "Cederle la AWP y jugar rifle esta vez",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, comm: clamp(c.stats.comm + 4) } };
          return { character, log: "Bajaste el conflicto cediendo terreno. +4 Comunicación." };
        }
      },
      {
        label: "Plantarte y no ceder el arma",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, aim: clamp(c.stats.aim + 3) }, tilt: clamp(c.tilt + 6) };
          return { character, log: "Te quedaste con la AWP, pero quedó tensión en el vestuario. +3 Aim, +6 Tilt." };
        }
      }
    ]
  },
  {
    id: "compañero_de_joda",
    phase: "tier2",
    title: "Un compañero se va de joda antes del partido",
    description:
      "La noche antes de un partido clave, un compañero decide salir igual 'total son solo un par de horas'. Vos te enterás por una historia de Instagram a las 3 AM.",
    condition: (c) => c.team !== null,
    choices: [
      {
        label: "Avisarle al IGL para que tome cartas en el asunto",
        apply: (c) => {
          const character = { ...c, reputation: clamp(c.reputation + 3), tilt: clamp(c.tilt + 3) };
          return { character, log: "El IGL puso orden, pero quedaste como el 'soplón' del grupo. +3 Reputación, +3 Tilt." };
        }
      },
      {
        label: "No decir nada y compensar vos con más nivel",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, mental: clamp(c.stats.mental + 3) }, form: clamp(c.form + 4, -100, 100) };
          return { character, log: "Decidiste dar el ejemplo en silencio. +3 Mental, +4 Forma." };
        }
      }
    ]
  },
  {
    id: "cambio_de_igl",
    phase: "tier2",
    title: "El equipo cambia de IGL a mitad de temporada",
    description:
      "Los resultados no acompañan y la organización decide rotar al IGL. Todo el sistema táctico que venían armando se tira abajo de un día para el otro.",
    condition: (c) => c.team !== null,
    choices: [
      {
        label: "Ofrecerte vos como nuevo IGL",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, comm: clamp(c.stats.comm + 6), aim: clamp(c.stats.aim - 2) } };
          return { character, log: "Te subiste al desafío de liderar. +6 Comunicación, -2 Aim (menos horas de DM puro)." };
        }
      },
      {
        label: "Adaptarte al nuevo sistema sin pedir protagonismo",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, utility: clamp(c.stats.utility + 3) } };
          return { character, log: "Te acomodaste rápido al nuevo esquema. +3 Utility." };
        }
      }
    ]
  },
  {
    id: "mercado_de_pases_rumor",
    phase: "tier2",
    title: "Rumores de mercado de pases",
    description:
      "Un periodista de la escena filtra que tu equipo está evaluando reemplazarte por un jugador más joven. Nadie de la organización lo confirma ni lo desmiente.",
    condition: (c) => c.team !== null && c.contract !== null,
    choices: [
      {
        label: "Redoblar el esfuerzo en cada práctica",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, aim: clamp(c.stats.aim + 3) }, fatigue: clamp(c.fatigue + 10) };
          return { character, log: "Metiste horas extra para asegurar tu lugar. +3 Aim, +10 Fatiga." };
        }
      },
      {
        label: "Empezar a escuchar otras ofertas por las dudas",
        apply: (c) => {
          const character = { ...c, reputation: clamp(c.reputation - 3), fans: clamp(c.fans + 3) };
          return { character, log: "Se filtró que estás mirando el mercado. -3 Reputación con tu equipo actual, +3 Hinchada (la comunidad lo ve como picante)." };
        }
      }
    ]
  },
  {
    id: "clausula_de_rescision",
    phase: "tier1",
    title: "Otro equipo quiere pagar tu cláusula",
    description:
      "Una organización rival está dispuesta a pagar tu cláusula de rescisión completa para llevarte ya mismo, en medio de la temporada.",
    condition: (c) => c.contract !== null,
    choices: [
      {
        label: "Pedirle a tu equipo que negocie la salida",
        apply: (c) => {
          const character = { ...c, reputation: clamp(c.reputation - 6), money: { ...c.money, usd: c.money.usd + 500 } };
          return { character, log: "Generaste tensión con la dirigencia actual, pero sumaste un plus. -6 Reputación, +$500." };
        }
      },
      {
        label: "Quedarte y cumplir el contrato como corresponde",
        apply: (c) => {
          const character = { ...c, reputation: clamp(c.reputation + 6), fans: clamp(c.fans + 5) };
          return { character, log: "La palabra empeñada te ganó respeto en la escena. +6 Reputación, +5 Hinchada." };
        }
      }
    ]
  },

  // ---------------------------------------------------------
  // Sudamérica
  // ---------------------------------------------------------
  {
    id: "fala_muito",
    phase: "tier2",
    title: '"Fala muito, joga pouco"',
    description:
      "En la vuelta de un mapa cerrado contra un equipo brasileño, un rival te tira la clásica: hablás mucho pero jugás poco. Toda la sala del Discord se prende fuego.",
    condition: isSA,
    choices: [
      {
        label: "Responder con froteo picante en el chat",
        apply: (c) => {
          const character = { ...c, reputation: clamp(c.reputation + 5), fans: clamp(c.fans + 8), tilt: clamp(c.tilt + 5) };
          return { character, log: "Te ganaste el respeto de la comunidad por la respuesta. +5 Reputación, +8 Hinchada, +5 Tilt." };
        }
      },
      {
        label: "Ignorar y concentrarte en el próximo round",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, mental: clamp(c.stats.mental + 3) } };
          return { character, log: "Mantuviste la cabeza fría. +3 Mental." };
        }
      }
    ]
  },
  {
    id: "sueldo_ars_usd",
    phase: "tier3",
    title: "El sueldo: ¿pesos o dólares?",
    description:
      "La organización te ofrece renovar contrato, pero el mánager quiere pagarte en pesos argentinos con la inflación pisándote los talones, no en dólares como esperabas.",
    condition: isSA,
    choices: [
      {
        label: "Exigir el pago en USD o te vas",
        apply: (c) => {
          const character = { ...c, reputation: clamp(c.reputation - 5), money: { ...c.money, usd: c.money.usd + 500 } };
          return { character, log: "Negociaste fuerte y conseguiste dólares, pero quedaste marcado como 'difícil'. -5 Reputación, +500 USD." };
        }
      },
      {
        label: "Aceptar en pesos por lealtad al equipo",
        apply: (c) => {
          const character = { ...c, reputation: clamp(c.reputation + 8), money: { ...c.money, ars: c.money.ars + 300000 } };
          return { character, log: "El equipo valoró tu compromiso. +8 Reputación, +300.000 ARS." };
        }
      }
    ]
  },
  {
    id: "oferta_bootcamp_eu",
    phase: "tier1",
    once: true,
    title: "Bootcamp de prueba en Europa",
    description:
      "Una organización europea te invita a un bootcamp de prueba de tres semanas. Es la oportunidad, pero implica dejar todo en Sudamérica por un tiempo indefinido.",
    condition: isSA,
    choices: [
      {
        label: "Ir con todo, aunque duela dejar la familia",
        apply: (c) => {
          const character = { ...c, reputation: clamp(c.reputation + 12), stats: { ...c.stats, comm: clamp(c.stats.comm + 3) } };
          return { character, log: "El bootcamp te abrió la cabeza táctica. +12 Reputación, +3 Comunicación." };
        }
      },
      {
        label: "Pedir tiempo para pensarlo",
        apply: (c) => {
          const character = { ...c, reputation: clamp(c.reputation - 3) };
          return { character, log: "La duda se notó. La organización siguió mirando otras opciones. -3 Reputación." };
        }
      }
    ]
  },
  {
    id: "asado_post_torneo",
    phase: "tier3",
    title: "Asado post-torneo con el equipo",
    description: "Ganaron un torneo regional y el capitán organiza un asado para festejar. Podés ir a full o cuidarte para la próxima qualy.",
    condition: isSA,
    choices: [
      {
        label: "Ir al asado y disfrutar la previa",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, comm: clamp(c.stats.comm + 3) }, tilt: clamp(c.tilt - 5) };
          return { character, log: "El asado unió al equipo. +3 Comunicación, -5 Tilt." };
        }
      },
      {
        label: "Cuidarte y volver a entrenar temprano",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, aim: clamp(c.stats.aim + 2) } };
          return { character, log: "Priorizaste el entrenamiento. +2 Aim." };
        }
      }
    ]
  },
  {
    id: "qualy_contra_mibr",
    phase: "tier2",
    title: "Qualifier contra un grande de Brasil",
    description: "Les toca enfrentar a un equipo histórico brasileño en fase de grupos. La presión mediática es enorme para un roster todavía en construcción.",
    condition: isSA,
    choices: [
      {
        label: "Jugar el partido de tu vida, sin nada que perder",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, clutch: clamp(c.stats.clutch + 5) }, fans: clamp(c.fans + 6) };
          return { character, log: "Jugaste suelto, sin presión. +5 Clutch, +6 Hinchada." };
        }
      },
      {
        label: "Jugar conservador para no hacer el ridículo",
        apply: (c) => {
          const character = { ...c, tilt: clamp(c.tilt + 4) };
          return { character, log: "El respeto de más te jugó en contra. +4 Tilt." };
        }
      }
    ]
  },

  // ---------------------------------------------------------
  // Norteamérica
  // ---------------------------------------------------------
  {
    id: "beca_universitaria",
    phase: "tier3",
    title: "Beca universitaria vs. carrera profesional",
    description: "Tu universidad te ofrece una beca completa si dejás el CS competitivo para enfocarte en los estudios. El equipo te necesita para la qualy de este fin de semana.",
    condition: isNA,
    choices: [
      {
        label: "Rechazar la beca, todo o nada con el CS",
        apply: (c) => {
          const character = { ...c, reputation: clamp(c.reputation + 6), stats: { ...c.stats, mental: clamp(c.stats.mental - 3) } };
          return { character, log: "Apostaste todo al CS. +6 Reputación, -3 Mental (la presión familiar pesa)." };
        }
      },
      {
        label: "Aceptar la beca y jugar part-time",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, mental: clamp(c.stats.mental + 5) }, reputation: clamp(c.reputation - 4) };
          return { character, log: "Balanceaste estudio y CS. +5 Mental, -4 Reputación (menos horas de práctica)." };
        }
      }
    ]
  },
  {
    id: "franchise_offer",
    phase: "tier2",
    title: "Oferta de una franquicia con inversión",
    description: "Una organización con respaldo de capital de riesgo te ofrece un contrato con salario fijo en dólares, pero piden exclusividad total de imagen.",
    condition: isNA,
    choices: [
      {
        label: "Firmar el contrato con exclusividad",
        apply: (c) => {
          const character = { ...c, money: { ...c.money, usd: c.money.usd + 1500 }, reputation: clamp(c.reputation + 6) };
          return { character, log: "Firmaste con la franquicia. +$1500, +6 Reputación." };
        }
      },
      {
        label: "Negociar para mantener tu marca personal",
        apply: (c) => {
          const character = { ...c, fans: clamp(c.fans + 8), money: { ...c.money, usd: c.money.usd + 600 } };
          return { character, log: "Negociaste quedarte con tu imagen. +8 Hinchada, +$600." };
        }
      }
    ]
  },
  {
    id: "lan_texas",
    phase: "tier1",
    title: "LAN en Texas con público gringo",
    description: "Jugás tu primera LAN grande en Norteamérica. El público local grita fuerte por el equipo rival, un clásico de la región.",
    condition: isNA,
    choices: [
      {
        label: "Alimentarte de la energía del estadio",
        apply: (c) => {
          const character = { ...c, form: clamp(c.form + 8, -100, 100), fans: clamp(c.fans + 6) };
          return { character, log: "El ambiente de LAN te potenció. +8 Forma, +6 Hinchada." };
        }
      },
      {
        label: "Aislarte con los auriculares y bloquear todo",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, mental: clamp(c.stats.mental + 4) } };
          return { character, log: "Te encerraste en tu burbuja. +4 Mental." };
        }
      }
    ]
  },

  // ---------------------------------------------------------
  // Europa
  // ---------------------------------------------------------
  {
    id: "visa_trabajo",
    phase: "tier3",
    title: "Trámites de visa de trabajo",
    description: "Para fichar por un equipo de otro país europeo necesitás resolver una visa de trabajo que puede demorar semanas y te saca de las prácticas.",
    condition: isEU,
    choices: [
      {
        label: "Contratar un gestor para acelerar el trámite",
        apply: (c) => {
          const character = { ...c, money: { ...c.money, usd: Math.max(0, c.money.usd - 200) }, reputation: clamp(c.reputation + 5) };
          return { character, log: "Resolviste la visa rápido. -$200, +5 Reputación." };
        }
      },
      {
        label: "Esperar el trámite normal y perder práctica",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, aim: clamp(c.stats.aim - 2) } };
          return { character, log: "Perdiste semanas de práctica en trámites. -2 Aim." };
        }
      }
    ]
  },
  {
    id: "academia_nordica",
    phase: "tier2",
    title: "Academia nórdica: disciplina de hierro",
    description: "Fichaste por una academia europea conocida por sus rutinas estrictas: horarios militares, análisis de datos y cero margen de error.",
    condition: isEU,
    choices: [
      {
        label: "Adaptarte a la disciplina total",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, utility: clamp(c.stats.utility + 6), mental: clamp(c.stats.mental + 3) } };
          return { character, log: "La disciplina nórdica te hizo mejor jugador. +6 Utility, +3 Mental." };
        }
      },
      {
        label: "Resistirte a las rutinas tan estrictas",
        apply: (c) => {
          const character = { ...c, tilt: clamp(c.tilt + 8), reputation: clamp(c.reputation - 3) };
          return { character, log: "Chocaste con el método del cuerpo técnico. +8 Tilt, -3 Reputación." };
        }
      }
    ]
  },
  {
    id: "prensa_europea",
    phase: "tier1",
    title: "Rueda de prensa europea",
    description: "Después de un resultado sorpresa, la prensa especializada europea te pide una entrevista en vivo frente a cámaras.",
    condition: isEU,
    choices: [
      {
        label: "Dar una entrevista carismática y directa",
        apply: (c) => {
          const character = { ...c, fans: clamp(c.fans + 12), reputation: clamp(c.reputation + 4) };
          return { character, log: "La entrevista se viralizó en la comunidad europea. +12 Hinchada, +4 Reputación." };
        }
      },
      {
        label: "Mantener un perfil bajo y respuestas cortas",
        apply: (c) => {
          const character = { ...c, stats: { ...c.stats, mental: clamp(c.stats.mental + 2) } };
          return { character, log: "Preferiste no exponerte de más. +2 Mental." };
        }
      }
    ]
  }
];

export function pickRandomEvent(character: Character, phase: string): GameEvent | null {
  const pool = EVENTS.filter(
    (e) =>
      (e.phase === phase || e.phase === "any") &&
      (!e.once || !character.seenEventIds.includes(e.id)) &&
      (!e.condition || e.condition(character))
  );
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
