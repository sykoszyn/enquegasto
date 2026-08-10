export default function UsdCardTip({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-ambar/20 bg-ambar/10 text-ambar ${
        compact ? 'px-3 py-2 text-[11px]' : 'px-4 py-3 text-xs'
      } leading-relaxed`}
    >
      💡 <strong>Tip:</strong> si gastaste en dólares, conviene pagar el
      resumen directamente en dólares para evitar impuestos.
    </div>
  )
}
