-- ============================================================================
-- Prise de rendez-vous (adhérents et non-adhérents)
-- ============================================================================

create type appointment_type as enum ('administratif', 'fle_atelier', 'autre');

-- ─── TABLE: appointment_slots ────────────────────────────────────────────────
-- Créneaux créés manuellement par l'association (via Supabase Studio)

create table public.appointment_slots (
  id          uuid default uuid_generate_v4() primary key,
  type        appointment_type not null,
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  capacity    integer not null default 1,
  created_at  timestamptz default now() not null
);

alter table public.appointment_slots enable row level security;

-- Les horaires ne sont pas des données sensibles : lecture publique nécessaire
-- pour afficher les créneaux disponibles sur la page /rendez-vous et pour que
-- le join fonctionne depuis l'onglet "Mes RDV" d'un adhérent.
create policy "Anyone can view slots"
  on public.appointment_slots for select
  using (true);

create policy "Service role can manage slots"
  on public.appointment_slots for all
  using ((select auth.role()) = 'service_role');

create index appointment_slots_start_at_idx on public.appointment_slots(start_at);

-- ─── TABLE: appointment_bookings ─────────────────────────────────────────────
-- Réservation d'un créneau par un adhérent connecté (user_id) ou un invité (guest_*)

create table public.appointment_bookings (
  id          uuid default uuid_generate_v4() primary key,
  slot_id     uuid references public.appointment_slots(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete set null,
  guest_name  text,
  guest_email text,
  guest_phone text,
  notes       text,
  status      text default 'confirmed' not null check (status in ('confirmed', 'cancelled')),
  created_at  timestamptz default now() not null,
  constraint appointment_bookings_identity check (user_id is not null or guest_email is not null)
);

alter table public.appointment_bookings enable row level security;

create policy "Users can view their own bookings"
  on public.appointment_bookings for select
  using ((select auth.uid()) = user_id);

create policy "Users can cancel their own bookings"
  on public.appointment_bookings for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Service role can manage bookings"
  on public.appointment_bookings for all
  using ((select auth.role()) = 'service_role');

create index appointment_bookings_slot_id_idx on public.appointment_bookings(slot_id);
create index appointment_bookings_user_id_idx on public.appointment_bookings(user_id);
