import { usePrivacy } from '../context/PrivacyContext'

export function formatMoney(n: number, currency: string) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n)
}

export default function Amount({
  value,
  currency,
  className = '',
}: {
  value: number
  currency: string
  className?: string
}) {
  const { hidden } = usePrivacy()
  return <span className={className}>{hidden ? '$ ***.***' : formatMoney(value, currency)}</span>
}
