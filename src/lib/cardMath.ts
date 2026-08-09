import type { CardPurchase } from '../types'

/** Primer día del mes de una fecha dada. */
export function monthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

/** ¿Está esta compra "activa" (con una cuota pendiente) en el mes dado? */
export function isPurchaseActiveInMonth(purchase: CardPurchase, month: Date): boolean {
  const first = new Date(purchase.first_installment_date)
  const firstM = first.getFullYear() * 12 + first.getMonth()
  const targetM = month.getFullYear() * 12 + month.getMonth()
  const diff = targetM - firstM
  return diff >= 0 && diff < purchase.installments
}

/** Número de cuota (1-based) que corresponde a este mes, o null si no aplica. */
export function installmentNumberInMonth(purchase: CardPurchase, month: Date): number | null {
  if (!isPurchaseActiveInMonth(purchase, month)) return null
  const first = new Date(purchase.first_installment_date)
  const firstM = first.getFullYear() * 12 + first.getMonth()
  const targetM = month.getFullYear() * 12 + month.getMonth()
  return targetM - firstM + 1
}

export function installmentAmount(purchase: CardPurchase): number {
  return purchase.total_amount / purchase.installments
}

/** Total que vence de una tarjeta en un mes dado, sumando cuotas activas. */
export function cardDueForMonth(purchases: CardPurchase[], month: Date): number {
  return purchases
    .filter((p) => isPurchaseActiveInMonth(p, month))
    .reduce((sum, p) => sum + installmentAmount(p), 0)
}

/** Igual que cardDueForMonth pero separado por moneda (ARS / USD). */
export function cardDueByCurrency(
  purchases: CardPurchase[],
  month: Date
): { ARS: number; USD: number } {
  const active = purchases.filter((p) => isPurchaseActiveInMonth(p, month))
  return {
    ARS: active
      .filter((p) => (p.currency ?? 'ARS') === 'ARS')
      .reduce((sum, p) => sum + installmentAmount(p), 0),
    USD: active
      .filter((p) => p.currency === 'USD')
      .reduce((sum, p) => sum + installmentAmount(p), 0),
  }
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
