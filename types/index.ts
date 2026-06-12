export type Plan = 'free' | 'starter' | 'pro' | 'business'
export type Severity = 'critical' | 'warning' | 'info'
export type Role = 'client' | 'admin'
export type Channel = 'email' | 'whatsapp' | 'sms'

export const PLAN_PRICES: Record<Plan, number> = {
  free: 0, starter: 39, pro: 99, business: 249
}

export const PLAN_LIMITS: Record<Plan, {
  countries: number
  severities: Severity[]
  channels: Channel[]
}> = {
  free:     { countries: 1, severities: ['critical'],                   channels: ['email'] },
  starter:  { countries: 2, severities: ['critical', 'warning'],        channels: ['email', 'whatsapp'] },
  pro:      { countries: 4, severities: ['critical', 'warning', 'info'],channels: ['email', 'whatsapp', 'sms'] },
  business: { countries: 99,severities: ['critical', 'warning', 'info'],channels: ['email', 'whatsapp', 'sms'] },
}

export interface Profile {
  id: string
  email: string
  name: string
  phone?: string
  country: string
  language: string
  role: Role
  plan: Plan
  is_active: boolean
  crops: string
  countries_watched: string
  notify_channels: string
  min_severity: Severity
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan_expires_at?: string
  created_at: string
  updated_at: string
}

export interface Alert {
  id: number
  user_id: string
  event_type: string
  severity: Severity
  substance_name: string
  substance_id?: string
  product_code?: string
  product_name?: string
  old_mrl?: string
  new_mrl?: string
  regulation?: string
  description: string
  country: string
  source: string
  detected_at?: string
  is_read: boolean
  created_at: string
}

export interface AlertStats {
  total: number
  unread: number
  critical: number
  warning: number
  info: number
}

export interface Snapshot {
  id: number
  snapshot_id: string
  country: string
  source: string
  db_creation_date?: string
  extracted_at: string
  total_substances: number
  total_records: number
  is_current: boolean
}

export interface DiffReport {
  id: number
  report_id: string
  snapshot_old?: string
  snapshot_new?: string
  country: string
  total_changes: number
  critical_count: number
  warning_count: number
  info_count: number
  generated_at: string
}

export interface AdminStats {
  total_clients: number
  active_clients: number
  plan_distribution: Record<Plan, number>
  total_alerts: number
  critical_alerts: number
  mrr_estimate: number
  last_pipeline_run?: string
}

// DB explorer types
export interface MaProduct {
  id: string
  name: string
  holder: string
  supplier: string
  category: string
  formulation: string
  ai: Array<{ n: string; c: string }>
  valid: string
  tox: string
  usages: Array<{
    culture: string
    pest: string
    dose: string
    dar: string
    max: string
  }>
}

export interface EsProduct {
  id: string
  name: string
  holder: string
  manufacturer: string
  ai: string
  conc: string
  ft: string
  status: string
  expiry: string
  reg_date: string
  renewal: string
}

export interface EuSubstance {
  id: string
  name: string
  flags: string[]
  reg: string
  count: number
  products: Array<{
    code: string
    name: string
    mrl: string
    type: string
    date: string
  }>
}
