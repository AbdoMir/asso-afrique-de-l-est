-- ============================================================================
-- Suivi des rendez-vous extérieurs des adhérents
-- ============================================================================
-- L'association accompagne des familles qui peinent à s'organiser : elle
-- traduit un courrier de préfecture, explique quoi préparer, et note la date du
-- rendez-vous. L'adhérent retrouve tout au même endroit, avec un rappel la
-- veille.
--
-- ⚠️ Ce traitement porte sur des données de l'art. 9. Un rendez-vous médical est
-- une donnée de santé ; un rendez-vous en préfecture révèle une situation
-- administrative. Il ne repose donc pas sur l'intérêt légitime mais sur le
-- **consentement explicite** de la personne (art. 9.2.a), recueilli dans son
-- espace adhérent, horodaté, et révocable à tout moment.

-- ─── Consentement ───────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists external_appointments_consent boolean not null default false;

alter table public.profiles
  add column if not exists external_appointments_consent_at timestamptz;

comment on column public.profiles.external_appointments_consent is
  'Consentement explicite (art. 9.2.a) au suivi des rendez-vous extérieurs. Sans lui, aucune saisie n''est possible — un trigger le vérifie en base.';

comment on column public.profiles.external_appointments_consent_at is
  'Date de recueil du consentement. C''est la preuve exigée par l''art. 7.1 : sans horodatage, un consentement ne se démontre pas.';

-- ─── Rendez-vous extérieurs ─────────────────────────────────────────────────
-- Table distincte de `appointment_bookings`, qui décrit les rendez-vous *avec*
-- l'association. Les deux n'ont ni le même cycle de vie, ni la même base
-- légale, ni la même durée de conservation : les mélanger reviendrait à
-- appliquer le régime le plus permissif aux données les plus sensibles.

create type external_appointment_category as enum (
  'prefecture',
  'sante',
  'caf',
  'france_travail',
  'logement',
  'ecole',
  'justice',
  'autre'
);

create table public.external_appointments (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references public.profiles(id) on delete cascade not null,
  category         external_appointment_category not null,
  -- Libellé court et neutre : « Renouvellement de titre de séjour », jamais un
  -- détail médical. La catégorie porte déjà l'information sensible.
  title            text not null check (length(title) between 2 and 120),
  starts_at        timestamptz not null,
  location         text check (location is null or length(location) <= 200),
  -- Seul champ libre subsistant. Son libellé dans l'interface est « Documents à
  -- apporter » et non « Notes » : la formulation oriente ce qu'on y écrit.
  preparation      text check (preparation is null or length(preparation) <= 1000),
  created_by       uuid references auth.users(id) on delete set null,
  reminder_sent_at timestamptz,
  created_at       timestamptz default now() not null
);

alter table public.external_appointments enable row level security;

-- L'adhérent consulte et supprime les siens. Il ne peut ni créer ni modifier :
-- la saisie passe par l'interface du personnel, seule à disposer du contexte.
create policy "Users can view their own external appointments"
  on public.external_appointments for select
  using ((select auth.uid()) = user_id);

create policy "Users can delete their own external appointments"
  on public.external_appointments for delete
  using ((select auth.uid()) = user_id);

create policy "Service role can manage external appointments"
  on public.external_appointments for all
  using ((select auth.role()) = 'service_role');

create index external_appointments_user_id_idx on public.external_appointments(user_id);
create index external_appointments_starts_at_idx on public.external_appointments(starts_at);

create index external_appointments_reminder_idx
  on public.external_appointments(starts_at)
  where reminder_sent_at is null;

comment on table public.external_appointments is
  'Rendez-vous extérieurs des adhérents (préfecture, santé, CAF...), saisis par le personnel. Données art. 9 : consentement explicite requis, purge automatique 3 mois après la date du rendez-vous.';

-- ─── Garde-fou : pas de saisie sans consentement ────────────────────────────
-- Le contrôle existe déjà dans l'API, mais une vérification applicative seule
-- tombe avec la première erreur de branchement ou le premier script d'import.
-- On la double en base, là où rien ne peut la contourner — même le rôle de
-- service. Sur le modèle du trigger de capacité (migration 009).

create or replace function public.check_external_appointment_consent()
returns trigger as $$
declare
  a_consenti boolean;
begin
  select external_appointments_consent into a_consenti
  from public.profiles
  where id = new.user_id;

  if a_consenti is not true then
    raise exception 'Cet adhérent n''a pas consenti au suivi de ses rendez-vous extérieurs.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Fonction interne : jamais exposée via /rest/v1/rpc (cf. migration 012).
revoke execute on function public.check_external_appointment_consent() from public, anon, authenticated;

drop trigger if exists external_appointments_consent_guard on public.external_appointments;

create trigger external_appointments_consent_guard
  before insert or update of user_id on public.external_appointments
  for each row execute procedure public.check_external_appointment_consent();
