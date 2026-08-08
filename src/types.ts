export type Kind = 'gasto' | 'ingreso'

export type PaymentMethod = 'efectivo' | 'debito' | 'credito' | 'transferencia_qr'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  debito: 'Débito',
  credito: 'Crédito',
  transferencia_qr: 'Transferencia/QR',
}

export interface Category {
  id: string
  user_id: string | null
  household_id: string | null
  name: string
  kind: Kind
  color: string
  icon: string | null
}

export interface Account {
  id: string
  user_id: string
  household_id: string | null
  name: string
  currency: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string | null
  kind: Kind
  amount: number
  description: string | null
  payment_method: PaymentMethod
  occurred_at: string
  created_at: string
  category?: Category | null
  account?: Account | null
}

export interface Household {
  id: string
  name: string
  owner_id: string
  invite_code: string
  created_at: string
}

export interface HouseholdMember {
  id: string
  household_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
}

export interface Card {
  id: string
  user_id: string
  household_id: string | null
  name: string
  closing_day: number
  due_day: number
  currency: string
  created_at: string
}

export interface CardPurchase {
  id: string
  card_id: string
  user_id: string
  category_id: string | null
  description: string
  total_amount: number
  installments: number
  first_installment_date: string
  created_at: string
  category?: Category | null
}

export interface CardPayment {
  id: string
  card_id: string
  month: string
  paid_at: string
  paid_by: string
}

export interface SavingsGoal {
  id: string
  user_id: string
  household_id: string | null
  name: string
  target_amount: number
  currency: string
  target_date: string | null
  created_at: string
}

export interface SavingsContribution {
  id: string
  goal_id: string
  user_id: string
  amount: number
  occurred_at: string
  note: string | null
}
