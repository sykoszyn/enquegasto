# En qué gasto?

App de finanzas personales: anotás gastos e ingresos, los agrupás por categoría
y cuenta, y ves un resumen de en qué se te va la plata. Landing + app funcional,
React + Vite + Tailwind, con Supabase como backend (auth + base de datos) y
pensada para deployar en Netlify.

## Estructura

```
src/
  pages/Landing.tsx      landing page
  pages/Login.tsx        login
  pages/Signup.tsx       registro
  pages/Dashboard.tsx    la app (protegida, requiere sesión)
  components/            formulario de carga, lista, gráfico, receipt animado
  lib/supabaseClient.ts  cliente de Supabase
  types.ts               tipos compartidos
supabase/schema.sql       tablas + Row Level Security, para correr en Supabase
netlify.toml               config de build/deploy para Netlify
```

## 1. Crear el proyecto en Supabase

1. Entrá a supabase.com y creá un proyecto nuevo.
2. Andá a **SQL Editor**, pegá el contenido de `supabase/schema.sql` y ejecutalo.
   Esto crea las tablas `accounts`, `categories`, `transactions` con Row Level
   Security ya configurado (cada usuario solo ve y edita sus propios datos).
3. Andá a **Authentication → Providers** y confirmá que **Email** esté
   habilitado (viene así por defecto). Si no querés que pida confirmación por
   mail mientras probás, podés desactivar "Confirm email" en
   **Authentication → Settings**.
4. Andá a **Project Settings → API** y copiá:
   - **Project URL**
   - **anon public key**

## 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Completá `.env` con los valores del paso anterior:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## 3. Correr en local

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173`. Creá una cuenta desde `/registro`: al entrar por
primera vez a `/app` se crean automáticamente una cuenta "Efectivo" y
categorías por defecto (Comida, Transporte, Casa, Salidas, Salud, Sueldo,
Otros ingresos), para que no arranques con todo vacío.

## 4. Deploy en Netlify

**Opción A — desde Git (recomendado):**

1. Subí este proyecto a un repo de GitHub/GitLab.
2. En Netlify: **Add new site → Import an existing project**, elegí el repo.
3. Build command: `npm run build` — Publish directory: `dist`
   (ya viene seteado en `netlify.toml`).
4. En **Site settings → Environment variables**, agregá:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.

**Opción B — Netlify CLI:**

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

(recordá configurar las mismas variables de entorno en el dashboard de Netlify
antes del deploy, o el build no va a poder conectarse a Supabase).

## 5. En Supabase, permití tu dominio de Netlify

En **Authentication → URL Configuration**, agregá la URL de tu sitio de
Netlify (ej. `https://en-que-gasto.netlify.app`) tanto en **Site URL** como en
**Redirect URLs**, para que la confirmación de mail y el login funcionen bien
en producción.

## Novedades grandes: casa compartida, tarjetas, ahorros, PWA, IA

Esta versión suma:

- **Casa compartida**: creá una "casa" desde Configuración, compartí el
  código con tu pareja/familia, y marcá cuentas o tarjetas como "de la casa"
  para que las vea todo el mundo.
- **Tarjetas con cuotas** (`/app/tarjetas`): cargás una compra en cuotas una
  vez, la app calcula sola cuánto vence cada mes, y podés marcar la tarjeta
  como pagada.
- **Metas de ahorro** (`/app/ahorros`): objetivo con importe y fecha, barra de
  progreso, y vas sumando aportes.
- **Resumen del mes rediseñado**: "Te queda por pagar / Pagado / Ingresos /
  Te queda" apenas entrás a `/app`.
- **Instalación como app (PWA)**: en el celular, abrís el sitio y tocás
  "Agregar a inicio" — queda como una app más, sin pasar por ninguna store.
- **Asistente por chat (opcional)**: botón flotante "Cargar hablando" que usa
  la API gratuita de Gemini para cargar gastos escribiendo en lenguaje
  natural. Necesita configuración aparte (ver abajo).

### Correr la migración nueva en Supabase

Andá al SQL Editor de Supabase y corré el archivo completo `supabase/schema.sql`
de nuevo (es seguro, es idempotente). Vas a ver una tabla nueva por cada
feature: `households`, `household_members`, `cards`, `card_purchases`,
`card_payments`, `savings_goals`, `savings_contributions`.

### Activar el asistente por chat (opcional)

1. Andá a [aistudio.google.com](https://aistudio.google.com/apikey) y creá una
   API key gratis (no pide tarjeta).
2. En Netlify, **Site configuration → Environment variables**, agregá
   `GEMINI_API_KEY` con esa key. **Importante:** esta variable NO lleva el
   prefijo `VITE_` — así se queda del lado del servidor (Netlify Function) y
   nunca se expone en el navegador.
3. Redeployá el sitio.
4. Si no configurás esto, la app funciona igual — solo no vas a poder usar el
   botón de "Cargar hablando" (te va a avisar con un error claro en vez de
   romperse).

La cuota gratis de Gemini (Flash) ronda los 1.500 pedidos por día, compartidos
entre todos los usuarios de tu proyecto. Para una app chica/mediana alcanza
de sobra; si crece mucho, ahí sí habría que pasar a un plan pago de Google.

## Qué falta / próximos pasos posibles

- Leer resúmenes de tarjeta en PDF con IA (más complejo: parsing de PDF +
  extracción estructurada).
- División de gastos compartidos ("quién le debe a quién").
- Notificaciones/recordatorios de vencimientos.

## Si ya tenías el proyecto corriendo: hay que migrar la base

Se agregó edición de movimientos, medio de pago (efectivo/débito/crédito/
transferencia-QR con default en transferencia/QR), gestión de categorías y
cuentas desde la app, exportar a CSV, y comparación con el mes anterior.

Si ya habías corrido `supabase/schema.sql` antes, **volvé a entrar al SQL
Editor de Supabase y corré de nuevo todo el archivo** (es seguro, usa
`IF NOT EXISTS` / `DROP ... CREATE`). Eso agrega:

- La columna `payment_method` en `transactions` (con default
  `transferencia_qr`, así los movimientos viejos no quedan rotos).
- Protección al borrar una cuenta: si tiene movimientos cargados, ahora la
  base rechaza el borrado en vez de borrar todo en cascada sin avisar. La app
  ya chequea esto antes y te avisa con un mensaje claro.

Después de correr el SQL, hacé un nuevo deploy en Netlify (o simplemente
recargá si estás en local) para que la app use las columnas nuevas.

Todo el diseño (paleta, tipografía, el "ticket" animado del hero) está en
`tailwind.config.js` y `src/components/ReceiptTape.tsx` si querés ajustarlo.
