export default function UsdCardTip({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-ambar/20 bg-ambar/10 text-ambar ${
        compact ? 'px-3 py-2 text-[11px]' : 'px-4 py-3 text-xs'
      } leading-relaxed`}
    >
      💡 <strong>Tip de ahorro:</strong> el Impuesto PAIS ya no existe (venció
      en enero de 2026), pero los consumos en dólares con tarjeta siguen
      llevando una percepción del 30% a cuenta de Ganancias/Bienes
      Personales. Si pagás el resumen directamente con tus dólares (MEP,
      cripto o caja de ahorro en USD) antes del vencimiento, evitás esa
      percepción de entrada. Si ya la pagaste, se puede recuperar: por
      SIRADIG si tributás Ganancias, o pidiendo la devolución directa ante
      ARCA si no tributás. Confirmá los porcentajes vigentes con tu banco,
      pueden cambiar.
    </div>
  )
}
