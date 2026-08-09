export type Kind = 'gasto' | 'ingreso'

export type PaymentMethod = 'efectivo' | 'debito' | 'credito' | 'transferencia_qr' | 'cripto'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  debito: 'Débito',
  credito: 'Crédito',
  transferencia_qr: 'Transferencia/QR',
  cripto: 'Cripto/USDT',
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
  currency: 'ARS' | 'USD'
  pay_plan: 'pesos' | 'usd'
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

export interface CategoryBudget {
  id: string
  user_id: string
  category_id: string
  monthly_limit: number
  created_at: string
  category?: Category | null
}

export interface RecurringExpense {
  id: string
  user_id: string
  household_id: string | null
  account_id: string
  category_id: string | null
  name: string
  kind: Kind
  amount: number
  day_of_month: number
  active: boolean
  created_at: string
  category?: Category | null
}

export interface RecurringLog {
  id: string
  recurring_id: string
  month: string
  transaction_id: string | null
  logged_by: string
  logged_at: string
}
