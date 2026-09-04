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
  is_staff: boolean
  /** Consentement explicite (art. 9.2.a) au suivi des rendez-vous extérieurs. */
  external_appointments_consent: boolean
  external_appointments_consent_at?: string | null
  created_at: string
  updated_at: string
}

// ─── Membership ────────────────────────────────────────────────────────────────

export type MembershipType = 'simple' | 'monthly_5' | 'monthly_10' | 'monthly_20'
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending'
export type DonationFrequency = 'once' | 'monthly'
/**
 * Reflète l'énumération `payment_method` de la migration 002, qui connaissait
 * déjà la carte et le prélèvement SEPA. Le type ne les déclarait pas : tant que
 * seul HelloAsso encaissait, l'écart ne se voyait pas.
 */
export type PaymentMethod =
  | 'card'
  | 'sepa_debit'
  | 'paypal'
  | 'bank_transfer'
  | 'cash_check'
  | 'helloasso'

export type Membership = {
  id: string
  user_id: string
  type: MembershipType
  status: MembershipStatus
  amount: number
  frequency: DonationFrequency
  /** Conservé pour les adhésions antérieures au passage à Stripe. */
  helloasso_ref?: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  payment_method?: PaymentMethod
  date_start: string
  date_end?: string
  created_at: string
  updated_at: string
}

// ─── Donations ─────────────────────────────────────────────────────────────────

export type DonationStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'cancelled'

export type Donation = {
  id: string
  user_id?: string
  amount: number
  frequency: DonationFrequency
  status: DonationStatus
  /** Clé d'idempotence du webhook Stripe — index unique depuis la migration 001. */
  stripe_payment_intent_id?: string
  stripe_subscription_id?: string
  /** Conservés pour les dons antérieurs au passage à Stripe. */
  helloasso_order_id?: string
  helloasso_payment_id?: string
  donor_name?: string
  donor_email?: string
  /** Adresse au moment du versement : c'est elle qui figure sur le reçu CERFA. */
  donor_address?: string
  donor_city?: string
  donor_zip_code?: string
  payment_method?: PaymentMethod
  membership_id?: string
  created_at: string
  updated_at: string
}

// ─── Fiscal Receipt ────────────────────────────────────────────────────────────

export type FiscalReceipt = {
  id: string
  /** NULL après suppression du compte : le reçu survit, détaché — voir archived_identity. */
  user_id: string | null
  donation_ids: string[]
  year: number
  total_amount: number
  cerfa_number: string
  pdf_url?: string
  sent_at?: string
  /**
   * Identité figée lors de la suppression du compte. Le reçu CERFA doit être
   * conservé 6 ans au titre de l'obligation comptable : sans cette copie, il ne
   * serait plus rattachable à personne.
   */
  archived_identity?: Record<string, unknown> | null
  created_at: string
}



// ─── Journal des accès ──────────────────────────────────────────────────────────

export type AuditLog = {
  id: string
  actor_id: string | null
  actor_email: string | null
  actor_role: 'staff' | 'member' | 'system'
  action: string
  resource_type: string | null
  resource_id: string | null
  metadata: Record<string, unknown> | null
  ip: string | null
  created_at: string
}

// ─── Appointments (rendez-vous) ─────────────────────────────────────────────────

export type AppointmentType = 'administratif' | 'fle_atelier' | 'autre'
export type AppointmentBookingStatus = 'confirmed' | 'cancelled'

export type AppointmentSlot = {
  id: string
  type: AppointmentType
  start_at: string
  end_at: string
  capacity: number
  created_at: string
}

/**
 * Motif choisi dans une liste fermée. Le champ « Précisions » en texte libre a
 * été retiré : c'est là que les personnes décrivaient spontanément leur
 * situation médicale ou administrative.
 */
export type AppointmentReason =
  | 'aide_administrative'
  | 'cours_francais'
  | 'emploi'
  | 'traduction'
  | 'autre'

export type AppointmentBooking = {
  id: string
  slot_id: string
  user_id?: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  reason?: AppointmentReason
  status: AppointmentBookingStatus
  /** Date d'envoi du rappel de la veille. */
  reminder_sent_at?: string
  created_at: string
}

// ─── Rendez-vous extérieurs ─────────────────────────────────────────────────────

/**
 * Rendez-vous de l'adhérent hors association, saisis par le personnel pour
 * l'aider à s'organiser. La catégorie suffit à qualifier une donnée de l'art. 9
 * (`sante`, `prefecture`) : le titre doit rester neutre.
 */
export type ExternalAppointmentCategory =
  | 'prefecture'
  | 'sante'
  | 'caf'
  | 'france_travail'
  | 'logement'
  | 'ecole'
  | 'justice'
  | 'autre'

export type ExternalAppointment = {
  id: string
  user_id: string
  category: ExternalAppointmentCategory
  title: string
  starts_at: string
  location?: string | null
  /** Documents à apporter. Seul champ libre : ne jamais y consigner de détail médical. */
  preparation?: string | null
  created_by?: string | null
  reminder_sent_at?: string | null
  created_at: string
}

// ─── Newsletter ────────────────────────────────────────────────────────────────

/** Double opt-in : ne jamais diffuser aux lignes dont `confirmed` est faux. */
export type NewsletterSubscriber = {
  id: string
  email: string
  first_name?: string
  consent: boolean
  confirmed: boolean
  confirmation_token?: string
  confirmed_at?: string
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
        Insert: Omit<Profile, 'created_at' | 'updated_at' | 'is_staff'> & { is_staff?: boolean }
        // is_staff n'est jamais modifiable via l'app (grant colonne retiré côté DB, voir 007_staff_role_column_grants_fix.sql)
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'is_staff'>>
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
      external_appointments: {
        Row: ExternalAppointment
        Insert: Omit<ExternalAppointment, 'id' | 'created_at'>
        Update: Partial<Omit<ExternalAppointment, 'id' | 'user_id' | 'created_at'>>
        Relationships: []
      }
      audit_log: {
        Row: AuditLog
        Insert: Omit<AuditLog, 'id' | 'created_at'>
        Update: Partial<Omit<AuditLog, 'id' | 'created_at'>>
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
      appointment_slots: {
        Row: AppointmentSlot
        Insert: Omit<AppointmentSlot, 'id' | 'created_at'>
        Update: Partial<Omit<AppointmentSlot, 'id' | 'created_at'>>
        Relationships: []
      }
      appointment_bookings: {
        Row: AppointmentBooking
        Insert: Omit<AppointmentBooking, 'id' | 'status' | 'created_at'> & { status?: AppointmentBookingStatus }
        Update: Partial<Omit<AppointmentBooking, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      /**
       * Attribue le prochain numéro de reçu fiscal de l'exercice, au format
       * AAAA-NNNN (migration 016). Réservée au rôle de service : l'exécution
       * est révoquée pour `anon` et `authenticated`, un appel libre permettant
       * de brûler des numéros et de trouer la série.
       */
      next_cerfa_number: {
        Args: { annee: number }
        Returns: string
      }
    }
  }
}
