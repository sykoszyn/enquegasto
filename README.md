# RoadToMajor 🎯

Simulador narrativo/RPG de gestión de carrera competitiva de **Counter-Strike 2**, ambientado
en la escena de la región que elijas (Sudamérica, Norteamérica o Europa), con equipos reales de
2026. Arrancás como FACEIT Level 1 y construís una carrera larga y peleada — contratos, banco de
suplentes, mercado de pases, prensa y redes incluidos — hasta (con suerte) levantar un CS2 Major.

Una partida completa dura entre 30 y 50 minutos.

## Stack

- **Next.js 15** (App Router, React 19, TypeScript)
- **Tailwind CSS** — tema oscuro estilo HLTV/FACEIT (`#ff7b00` naranja CS2, `#ffcc33` amarillo HLTV)
- **lucide-react** para iconografía
- **Supabase** (Postgres + RLS) para guardado de partidas y leaderboard global, con **fallback
  automático a `localStorage`** si no está configurado — el juego funciona sin backend.

## Estructura del proyecto

```
roadtomajor/
├── app/
│   ├── layout.tsx          # Layout raíz, fuentes y metadata
│   ├── globals.css         # Tema Tailwind + tipografías
│   ├── page.tsx            # Landing (hero + leaderboard)
│   └── game/
│       └── page.tsx        # Orquestador: pestañas + loop mensual/semanal
├── components/
│   ├── CharacterCreation.tsx    # Nickname, rol, región
│   ├── Tabs.tsx                  # Navegación: Dashboard / Equipo / Partidos / Prensa / Inventario
│   ├── GameHUD.tsx               # Stats, forma, tilt, fatiga, rival
│   ├── StatBar.tsx
│   ├── WeeklyEnergyAllocator.tsx # Gestión semanal de energía (100 pts: DM/Demos/Pugs/Gym)
│   ├── EventModal.tsx            # Eventos narrativos y de drama de equipo
│   ├── MatchSimulator.tsx        # Resultado de partido con stats estilo HLTV
│   ├── TeamOfferCard.tsx         # Ofertas de equipos con vista previa de contrato
│   ├── ContractCard.tsx          # Pestaña Equipo & Contrato (salario, rol, cláusula)
│   ├── MatchHistoryView.tsx      # Pestaña Partidos & Torneos
│   ├── PressFeedView.tsx         # Pestaña Redes & Prensa (feed dinámico)
│   ├── InventoryTab.tsx          # Pestaña Inventario + mercado de skins
│   ├── PreseasonPicker.tsx       # Cartas de mejora anuales
│   └── Leaderboard.tsx
├── lib/
│   ├── types.ts             # Tipos centrales (Character, Contract, Team, PressPost, etc.)
│   ├── gameEngine.ts         # Motor: personaje, energía semanal, partidos, banco, fases
│   ├── contracts.ts          # Generación y renovación de contratos (salario/rol/duración/cláusula)
│   ├── press.ts               # Generador de feed de redes/prensa dinámico
│   ├── events.ts              # Banco de eventos narrativos (cultura AR/SA/NA/EU + drama de equipo)
│   ├── teams.ts               # Equipos reales por región y tier (2026)
│   ├── skins.ts                # Mercado de skins
│   ├── persistence.ts          # Guardado/carga + leaderboard (Supabase o localStorage)
│   └── supabase/client.ts      # Cliente Supabase (browser)
├── supabase/
│   └── schema.sql             # Tablas players_carrer / leaderboard + RLS
├── .env.example
├── package.json
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

## Mecánicas principales

1. **Creación de personaje**: nickname, rol (Entry / Lurker / AWP / Support / IGL), región
   (Sudamérica, Norteamérica o Europa) — la región determina qué equipos reales vas a enfrentar
   y fichar en cada tier.
2. **Gestión semanal de energía**: cada mes repartís 100 puntos entre DM/Aim Lab, estudio de
   demos/utility, pugs de FPL/FACEIT y gimnasio/descanso. Cada categoría sube stats distintos y
   genera fatiga; el gimnasio la baja. Hay presets rápidos (Equilibrado, Foco en Aim, etc.).
3. **Sistema de contratos**: al fichar por un equipo recibís un contrato formal con salario
   mensual, rol asignado (Titular/Suplente/IGL/AWP), duración y cláusula de rescisión. El sueldo
   se cobra todos los meses; al vencer el contrato, se renueva automáticamente si tu rendimiento
   acompaña o quedás libre.
4. **Banco de suplentes**: si tu HLTV Rating promedio de los últimos partidos cae por debajo de
   1.00 estando bajo contrato, hay chance de que te manden al banco (con recorte de sueldo
   incluido). Mientras estás ahí no jugás — tenés que remontar entrenando para volver a ser titular.
5. **Eventos narrativos y drama de equipo**: peleas por quién agarra la AWP, compañeros que se
   van de joda antes de un partido clave, cambios de IGL a mitad de temporada, rumores de mercado
   de pases, más toda la cultura regional (fala muito, sueldo en pesos vs dólares, visa de trabajo
   en Europa, becas universitarias en Norteamérica, etc.).
6. **Redes & Prensa**: después de partidos importantes se genera un feed dinámico con reacciones
   de hinchas, hinchas brasileños, casters y prensa especializada — todo según cómo te fue.
7. **Partidos simulados**: HLTV Rating 2.0 aproximado a partir de stats, forma, tilt y fatiga,
   con K/D, ADR y narrativa de clutch.
8. **Progresión de fases**: `faceit → tier3 → tier2 → tier1 → major`, con equipos reales de tu
   región en cada escalón (ver `lib/teams.ts`) y el pool mundial de Tier 1 compartido para el
   salto final y el Major (Opening Stage → Elimination Stage → Gran Final).
9. **Pretemporada anual**: cada cumpleaños elegís 1 de 3 cartas de mejora (bootcamp, psicólogo
   deportivo, curso de IGL, etc.), estilo "El Ídolo".
10. **Rival de toda la vida**: un NPC que progresa en paralelo desde que arrancás, y se compara
    con vos al retirarte — junto con una comparación de tu carrera contra una leyenda real del CS2.
11. **Mercado de skins**: Redline, Asiimov, Fire Serpent, Karambit Fade, Dragon Lore y más,
    comprables con el prize money ganado, en la pestaña Inventario.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # opcional: completar con tus credenciales de Supabase
npm run dev
```

Abrí `http://localhost:3000`.

> Si no configurás `.env.local`, el juego funciona igual: usa `localStorage` para guardar la
> partida y el leaderboard queda local a tu navegador.

## Configurar Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, ejecutá el contenido de `supabase/schema.sql` (crea las tablas
   `players_carrer` y `leaderboard` con Row Level Security habilitada).
3. En **Settings → API**, copiá `Project URL` y `anon public key`.
4. Completá `.env.local` (o las variables de entorno en Vercel) con:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

> Si ya tenías desplegada una versión anterior con la tabla `saves`, podés migrarla corriendo
> `alter table saves rename to players_carrer;` en el SQL Editor antes de correr el schema nuevo.

## Deploy en Vercel

1. Subí el repo a GitHub.
2. Importá el repo en [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Next.js** (auto-detectado).
4. Agregá las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` en Project Settings → Environment Variables.
5. Deploy.

## Dominio con Cloudflare

1. Agregá el dominio en el dashboard de Cloudflare y apuntá los nameservers.
2. En Vercel, Project Settings → Domains, agregá tu dominio.
3. En Cloudflare DNS, creá el registro `CNAME` (o `A`) que Vercel indica, con el proxy
   (nube naranja) en modo **DNS only** durante la validación inicial del certificado SSL de
   Vercel; podés volver a activar el proxy de Cloudflare después.

## Próximos pasos sugeridos

- Autenticación real de usuarios (Supabase Auth) para reemplazar el `user_id: 'anon'`.
- Feed de prensa persistente entre sesiones (hoy vive dentro del personaje guardado).
- Más equipos e ilustraciones/logos por tier en `lib/teams.ts`.
- Sistema de transferencias explícito (vender tu cláusula a otro equipo desde la UI).
