// ─── User & Auth ───────────────────────────────────────────────────────────────

export type Profile = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  city?: string
  zip_code?: string
  country?: string
  created_at: string
  updated_at: string
}

// ─── Membership ────────────────────────────────────────────────────────────────

export type MembershipType = 'simple' | 'monthly_5' | 'monthly_10' | 'monthly_20'
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending'
export type DonationFrequency = 'once' | 'monthly'
export type PaymentMethod = 'card' | 'sepa_debit' | 'paypal' | 'bank_transfer' | 'cash_check' | 'helloasso'

export type Membership = {
  id: string
  user_id: string
  type: MembershipType
  status: MembershipStatus
  amount: number
  frequency: DonationFrequency
  helloasso_ref?: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  payment_method?: PaymentMethod
  date_start: string
  date_end?: string
  created_at: string
  updated_at: string
}

export interface MembershipFormula {
  id: MembershipType
  label: string
  amount: number
  frequency: DonationFrequency
  description: string
  benefits: string[]
  provider: 'helloasso' | 'stripe'
  highlighted?: boolean
  badge?: string
  color: string
}

// ─── Donations ─────────────────────────────────────────────────────────────────

export type DonationStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'cancelled'

export type Donation = {
  id: string
  user_id?: string
  amount: number
  frequency: DonationFrequency
  status: DonationStatus
  stripe_payment_intent_id?: string
  stripe_subscription_id?: string
  helloasso_order_id?: string
  donor_name?: string
  donor_email?: string
  payment_method?: PaymentMethod
  created_at: string
  updated_at: string
}

// ─── Fiscal Receipt ────────────────────────────────────────────────────────────

export type FiscalReceipt = {
  id: string
  user_id: string
  donation_ids: string[]
  year: number
  total_amount: number
  cerfa_number: string
  pdf_url?: string
  sent_at?: string
  created_at: string
}

// ─── Member Document ───────────────────────────────────────────────────────────

export type MemberDocument = {
  id: string
  user_id: string
  file_name: string
  storage_path: string
  mime_type: string
  size_bytes: number
  label?: string
  created_at: string
}

// ─── Newsletter ────────────────────────────────────────────────────────────────

export type NewsletterSubscriber = {
  id: string
  email: string
  first_name?: string
  consent: boolean
  created_at: string
}

// ─── Contact ───────────────────────────────────────────────────────────────────

export type ContactMessage = {
  id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  read: boolean
  created_at: string
}

// ─── Form Types ────────────────────────────────────────────────────────────────

export interface DonationFormData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  city?: string
  zip_code?: string
  formula: MembershipType
  custom_amount?: number
  comment?: string
  accept_statutes: boolean
  newsletter_consent?: boolean
  sepa_mandate_consent?: boolean
}

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface NewsletterFormData {
  email: string
  first_name?: string
  consent: boolean
}

// ─── API Responses ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface StripeSubscriptionResponse {
  clientSecret: string
  subscriptionId: string
  customerId: string
}

export interface HelloAssoCheckoutResponse {
  redirectUrl: string
  orderId: string
}

// ─── Impact Stats ──────────────────────────────────────────────────────────────

export interface ImpactStat {
  label: string
  value: number
  suffix?: string
  prefix?: string
  description: string
  icon: string
}

// ─── Team Member ───────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string
  name: string
  role: string
  bio?: string
  photo?: string
  social?: {
    linkedin?: string
    twitter?: string
  }
}

// ─── Testimonial ───────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string
  name: string
  role: string
  photo?: string
  quote: string
  location?: string
}

// ─── Action / Project ──────────────────────────────────────────────────────────

export type FocusType = 'translation' | 'youth' | 'employment'

export interface Action {
  id: string
  title: string
  description: string
  image?: string
  focus?: FocusType
  status: 'active' | 'completed' | 'upcoming'
  date?: string
  beneficiaries?: number
}

// ─── Partner ───────────────────────────────────────────────────────────────────

export interface Partner {
  id: string
  name: string
  logo?: string
  url?: string
  category: 'institutional' | 'corporate' | 'association' | 'media'
}

// ─── Supabase Database Types ────────────────────────────────────────────────────

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
        Relationships: []
      }
      memberships: {
        Row: Membership
        Insert: Omit<Membership, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Membership, 'id' | 'created_at'>>
        Relationships: []
      }
      donations: {
        Row: Donation
        Insert: Omit<Donation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Donation, 'id' | 'created_at'>>
        Relationships: []
      }
      fiscal_receipts: {
        Row: FiscalReceipt
        Insert: Omit<FiscalReceipt, 'id' | 'created_at'>
        Update: Partial<Omit<FiscalReceipt, 'id' | 'created_at'>>
        Relationships: []
      }
      member_documents: {
        Row: MemberDocument
        Insert: Omit<MemberDocument, 'id' | 'created_at'>
        Update: Partial<Omit<MemberDocument, 'id' | 'user_id' | 'created_at'>>
        Relationships: []
      }
      newsletter_subscribers: {
        Row: NewsletterSubscriber
        Insert: Omit<NewsletterSubscriber, 'id' | 'created_at'>
        Update: Partial<Omit<NewsletterSubscriber, 'id'>>
        Relationships: []
      }
      contact_messages: {
        Row: ContactMessage
        Insert: Omit<ContactMessage, 'id' | 'read' | 'created_at'>
        Update: Partial<Omit<ContactMessage, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
