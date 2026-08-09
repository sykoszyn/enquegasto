# En qué gasto?

App de finanzas personales: anotás gastos e ingresos, los agrupás por
categoría y cuenta, controlás tarjetas con cuotas, compartís cuentas con tu
familia, y tenés un asistente por IA para cargar gastos hablando o
adjuntando el PDF de un resumen. React + Vite + Tailwind, con Supabase como
backend y desplegada en **Vercel**.

## Estructura

```
src/
  pages/            Landing, Login, Signup, Dashboard, Cards, Savings, Settings
  components/       formularios, listas, gráficos, AppShell (nav), etc.
  context/          AuthContext (sesión global), PrivacyContext (modo incógnito)
  lib/              cliente de Supabase, cálculos de cuotas, CSV, caché local
  types.ts          tipos compartidos
api/                Vercel Serverless Functions (ai-chat.js, donar.js)
supabase/schema.sql tablas + Row Level Security, para correr en Supabase
vercel.json         config de rewrites para el routing de React
```

## 1. Crear el proyecto en Supabase

1. Entrá a supabase.com y creá un proyecto nuevo.
2. En **SQL Editor**, pegá el contenido de `supabase/schema.sql` completo y
   ejecutalo. Es idempotente: podés volver a correrlo entero cada vez que
   este archivo se actualice, sin romper nada existente. Crea todas las
   tablas (cuentas, categorías, movimientos, casas compartidas, tarjetas con
   cuotas, metas de ahorro, presupuestos, recurrentes) con RLS configurado.
3. En **Authentication → Providers**, confirmá que **Email** esté habilitado.
   Si no querés pedir confirmación por mail, desactivá "Confirm email" en
   **Authentication → Settings**.
4. En **Project Settings → API**, copiá la **Project URL** y la
   **Publishable key** (el nuevo nombre de la `anon key`).

## 2. Variables de entorno

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

## 3. Correr en local

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173`. Al entrar por primera vez a `/app` se crean
automáticamente una cuenta "Efectivo" y categorías por defecto.

Para probar también las funciones de `/api` en local (IA y donaciones)
necesitás la [Vercel CLI](https://vercel.com/docs/cli):

```bash
npm install -g vercel
vercel dev
```

## 4. Deploy en Vercel

1. Subí el proyecto a GitHub/GitLab.
2. En [vercel.com](https://vercel.com), **Add New → Project**, importá el
   repo. Vercel detecta Vite automáticamente (build command `npm run build`,
   output `dist`).
3. En **Settings → Environment Variables**, agregá:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY` (opcional, para el asistente de IA — ver más abajo)
   - `MP_ACCESS_TOKEN` (opcional, para donaciones — ver más abajo)
4. Deploy.

`vercel.json` ya trae el rewrite necesario para que las rutas de React
(`/app`, `/login`, etc.) funcionen al entrar directo o refrescar la página,
sin pisar las funciones de `/api`.

## 5. En Supabase, permití tu dominio de Vercel

En **Authentication → URL Configuration**, poné la URL de tu deploy de
Vercel (ej. `https://quegasto.app` o `https://tu-proyecto.vercel.app`) tanto
en **Site URL** como en **Redirect URLs** (con `/**` al final). Sin esto, el
login/registro tira el error "requested path is invalid".

## Asistente de IA (opcional)

Botón flotante "Cargar hablando": escribís en lenguaje natural ("súper 15
mil en efectivo") o adjuntás con el clip 📎 el PDF/foto de un resumen de
tarjeta para que extraiga todos los movimientos de una.

Usa la API gratuita de Google Gemini (1.500 pedidos/día gratis, sin tarjeta):

1. Sacá una API key en [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. En Vercel, agregá la variable `GEMINI_API_KEY` (sin prefijo `VITE_`, así
   queda del lado del servidor y nunca se expone en el navegador).
3. Redeployá.

Sin esto configurado, el resto de la app funciona igual — el botón de chat
avisa con un error claro en vez de romperse.

## Donaciones con Mercado Pago (opcional)

Botón "Apoyar el proyecto" en Ajustes, con montos prefijados o personalizados.

1. Sacá tu **Access Token de producción** en
   [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app).
2. En Vercel, agregá la variable `MP_ACCESS_TOKEN` (sin prefijo `VITE_`).
3. Redeployá.

## Otras features de esta versión

- **Casa compartida**: creás una "casa" en Ajustes, compartís el código de
  invitación, y marcás cuentas/tarjetas como "de la casa" para que las vea
  todo el mundo.
- **Tarjetas con cuotas** (`/app/tarjetas`): cargás la compra una vez, la app
  calcula sola cuánto vence cada mes, con botón de "marcar pagado".
- **Metas de ahorro** (`/app/ahorros`): objetivo con barra de progreso.
- **Presupuestos por categoría**: límite mensual con barra
  verde→amarillo→rojo (en Ajustes).
- **Gastos recurrentes**: Netflix, alquiler, etc. — un toque por mes para
  cargarlos (en Ajustes).
- **Modo incógnito**: ícono de ojo en el header oculta todos los montos.
- **Carga rápida (FAB)**: botón "+" siempre visible, dos toques para anotar.
- **Editar/borrar movimientos**, categorías y cuentas totalmente editables,
  medio de pago por movimiento (efectivo/débito/crédito/transferencia-QR).
- **Exportar a CSV**, **instalación como PWA** (Agregar a inicio, sin store).
- **Rendimiento**: code splitting por página, skeleton loaders, caché local
  para que el Dashboard pinte al instante mientras confirma datos frescos.

## Novedades de esta tanda: cripto, atajos, vibración, íconos, filtros

- **Medio de pago cripto/USDT** sumado a efectivo/débito/crédito/transferencia.
- **Atajo de teclado**: tocar **N** o **+** en cualquier parte (desktop) abre
  la carga rápida. Se ignora si estás escribiendo en un campo de texto.
- **Vibración háptica**: al confirmar un gasto, el celular vibra corto (si el
  navegador lo soporta).
- **Íconos por categoría**: elegís un emoji al crear una categoría, se ve en
  la lista y en cada movimiento. Las categorías por defecto ya vienen con uno.
- **Filtro de fechas personalizado**: en el Dashboard, arriba de la lista de
  movimientos, elegís "del / al" para ver cualquier rango (ej. del 20 al 20).
- **Aviso de inactividad**: banner si pasaron 2+ días sin cargar nada.
- **Selector $ / US$ en el header**: ahora con **cotización en vivo real**
  desde [dolarapi.com](https://dolarapi.com) (dólar oficial y dólar cripto,
  a elección tuya en Ajustes). Se cachea 10 minutos en el navegador para no
  golpear la API de más, y podés forzar una actualización manual.
- **Empty states con ícono** en vez de solo texto, en movimientos, gráfico,
  tarjetas y ahorros.

- **Alertas de tarjeta en dólares**: cuando cargás un consumo marcado en
  USD, aparece un tip inteligente y actualizado (el Impuesto PAIS ya no
  existe desde enero de 2026 — hoy solo queda la percepción del 30% a
  cuenta de Ganancias/Bienes Personales, que se puede evitar pagando en
  dólares o recuperar después). Cada consumo en USD tiene un toggle para
  marcar si pensás pagarlo en pesos o en dólares, y los totales de "por
  pagar" en Tarjetas y en el resumen del Dashboard se muestran separados
  por moneda (no se mezclan ARS con USD en la misma suma).

## Qué falta / próximos pasos posibles

- División de gastos compartidos ("quién le debe a quién").
- Notificaciones/recordatorios de vencimientos.
- Offline-first completo con React Query (hoy hay una versión liviana con
  caché en localStorage solo para el Dashboard).
