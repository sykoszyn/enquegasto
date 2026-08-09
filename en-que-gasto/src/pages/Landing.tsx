import { Link } from 'react-router-dom'
import {
  Wallet,
  CreditCard,
  Users,
  PiggyBank,
  PieChart,
  Layers,
  Download,
  ShieldOff,
  Smartphone,
  ArrowRight,
} from 'lucide-react'
import AppPreview from '../components/AppPreview'
import FadeIn from '../components/FadeIn'
import useUserCount from '../lib/useUserCount'

const FEATURES = [
  {
    icon: Wallet,
    color: 'brand',
    title: 'Cargar en dos toques',
    body: 'Importe, categoría y listo. Sin formularios eternos.',
  },
  {
    icon: CreditCard,
    color: 'ambar',
    title: 'Tarjetas con cuotas',
    body: 'Cargás la compra una vez, la app te muestra sola cuánto vence cada mes.',
  },
  {
    icon: Users,
    color: 'violet',
    title: 'Compartila con tu casa',
    body: 'Cuentas y tarjetas compartidas con tu pareja o familia, con un código.',
  },
  {
    icon: PiggyBank,
    color: 'brand',
    title: 'Metas de ahorro',
    body: 'Objetivo con fecha e importe, y una barra que se llena a medida que ahorrás.',
  },
  {
    icon: PieChart,
    color: 'ambar',
    title: 'En qué se te va la plata',
    body: 'Gráfico por categoría y comparación automática mes a mes.',
  },
  {
    icon: Layers,
    color: 'violet',
    title: 'Varias monedas',
    body: 'Cada cuenta con la suya propia, sin mezclar todo.',
  },
  {
    icon: Smartphone,
    color: 'brand',
    title: 'Sin pasar por ninguna store',
    body: 'La instalás desde el navegador, tocando "Agregar a inicio".',
  },
  {
    icon: Download,
    color: 'ambar',
    title: 'Tus datos, tuyos',
    body: 'Exportás todo a CSV cuando quieras.',
  },
  {
    icon: ShieldOff,
    color: 'violet',
    title: 'Sin conectarse a tu banco',
    body: 'No pedimos claves bancarias. Vos anotás lo que querés que esté.',
  },
]

const FAQ = [
  {
    q: '¿Se conecta a mi banco?',
    a: 'No. No pedimos claves bancarias ni nos integramos con ninguna entidad. Todo lo que ves lo cargaste vos.',
  },
  {
    q: '¿Es gratis?',
    a: 'Sí, todo. No hay planes pagos ni publicidad.',
  },
  {
    q: '¿Cómo la instalo?',
    a: 'La abrís en el navegador del celular y tocás "Agregar a inicio". Queda como una app más, sin pasar por ninguna tienda.',
  },
  {
    q: '¿Puedo compartirla con mi pareja o familia?',
    a: 'Sí. Creás una casa desde Ajustes, pasás el código, y las cuentas y tarjetas compartidas las ven todos los miembros.',
  },
  {
    q: '¿Cómo maneja las cuotas de la tarjeta?',
    a: 'Cargás el importe total y la cantidad de cuotas una sola vez, y listo.',
  },
]

const colorClasses: Record<string, { bg: string; text: string }> = {
  brand: { bg: 'bg-brand/10', text: 'text-brand' },
  ambar: { bg: 'bg-ambar/10', text: 'text-ambar' },
  violet: { bg: 'bg-violet/10', text: 'text-violet' },
}

export default function Landing() {
  const userCount = useUserCount()
  const userCountLabel =
    userCount !== null ? new Intl.NumberFormat('es-AR').format(userCount) : null

  return (
    <div className="min-h-screen overflow-x-hidden bg-bg text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-sm font-extrabold text-bg">
            $
          </span>
          <span className="text-sm font-bold tracking-tight">En qué gasto?</span>
        </span>
        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white"
          >
            Entrar
          </Link>
          <Link
            to="/registro"
            className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-bg shadow-glow transition hover:brightness-110"
          >
            Crear cuenta
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-8 md:grid-cols-2 md:items-center md:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 -top-20 h-96 w-96 rounded-full glow-violet blur-3xl"
        />
        <div className="relative">
          {userCountLabel && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-bg-border bg-bg-surface px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              <p className="text-xs text-white/70">
                <span className="font-bold text-white">{userCountLabel}</span> personas
                ya lo usan
              </p>
            </div>
          )}
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Sabé en qué
            <span className="bg-gradient-to-r from-brand to-violet bg-clip-text text-transparent">
              {' '}se te va la plata
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/60">
            Anotá gastos e ingresos, compartí cuentas con tu familia y controlá
            las cuotas de la tarjeta — todo en una app gratis y sin vueltas.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/registro"
              className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-bg shadow-glow transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Empezar gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-white/40">Sin tarjeta. Sin límites.</span>
          </div>
        </div>

        <div className="relative md:pl-6">
          <AppPreview />
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-bg-border/60 bg-bg-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">
              Todo lo que necesitás
            </p>
          </FadeIn>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              const c = colorClasses[f.color]
              return (
                <FadeIn key={f.title} delay={(i % 3) * 90}>
                  <div className="group h-full rounded-2xl border border-bg-border bg-bg-surface p-6 shadow-card transition hover:-translate-y-1 hover:border-white/10">
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${c.bg}`}
                    >
                      <Icon className={`h-5 w-5 ${c.text}`} strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-4 text-sm font-bold text-white">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                      {f.body}
                    </p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <FadeIn>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Preguntas
          </p>
        </FadeIn>
        <div className="mt-6 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-bg-border bg-bg-surface px-5 py-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white marker:content-none">
                {item.q}
                <span className="ml-4 text-white/30 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative border-t border-bg-border/60 px-6 py-24 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute right-1/2 top-1/2 h-72 w-72 -translate-y-1/2 translate-x-1/2 rounded-full glow-brand blur-3xl"
        />
        <FadeIn>
          <h2 className="text-3xl font-extrabold">Empezá a anotar hoy</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-white/55">
            Dos minutos para crear tu cuenta.
          </p>
          <Link
            to="/registro"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-sm font-bold text-bg shadow-glow transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Crear mi cuenta <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </section>

      <footer className="border-t border-bg-border/60 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-white/30 md:flex-row">
          <span className="font-bold">En qué gasto?</span>
          <span>Proyecto independiente. Tus datos son tuyos.</span>
        </div>
      </footer>
    </div>
  )
}
