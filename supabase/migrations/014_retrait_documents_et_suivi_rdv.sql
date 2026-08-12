-- ============================================================================
-- Retrait du dépôt de documents et suivi structuré des rendez-vous
-- ============================================================================
-- Décision du bureau de l'association, août 2026 : l'espace adhérent ne
-- recevra plus de pièces administratives ni de documents de santé. Ces pièces
-- sont traitées de la main à la main, et l'espace adhérent devient un tableau
-- de suivi des rendez-vous.
--
-- C'est la mesure de protection la plus forte disponible : une donnée qu'on ne
-- détient pas ne peut ni fuiter, ni être réclamée, ni être oubliée dans une
-- sauvegarde. Elle place le traitement hors du champ de l'art. 9, là où aucune
-- mesure technique n'aurait suffi à l'y soustraire.

-- ─── Suppression du dépôt de documents ──────────────────────────────────────

drop table if exists public.member_documents cascade;

drop policy if exists "Users can manage their own documents storage" on storage.objects;
drop policy if exists "Service role can manage member documents storage" on storage.objects;

-- Les fichiers et le bucket `member-documents` ont été supprimés via l'API
-- Storage le 12 août 2026 (2 fichiers). Supabase interdit la suppression
-- directe dans `storage.objects` — un garde-fou contre les objets orphelins —
-- et cette étape ne peut donc pas figurer dans une migration SQL.

-- ─── Motif de rendez-vous : liste fermée au lieu de texte libre ─────────────
-- Le champ « Précisions » était renseigné dans les 8 réservations existantes.
-- C'est là que les personnes décrivaient spontanément leur situation — une
-- convocation de préfecture, un souci de santé, un recours en cours. Fermer le
-- dépôt de documents tout en gardant ce champ n'aurait fermé que la grande
-- porte.
--
-- Le motif devient un choix parmi une liste : il renseigne l'association sur
-- la nature du rendez-vous sans jamais recueillir de récit personnel.

create type appointment_reason as enum (
  'aide_administrative',
  'cours_francais',
  'emploi',
  'traduction',
  'autre'
);

alter table public.appointment_bookings
  add column if not exists reason appointment_reason;

-- Les notes existantes sont détruites, sans reprise possible : elles sont
-- précisément ce dont l'association a décidé de ne plus être dépositaire.
alter table public.appointment_bookings
  drop column if exists notes;

comment on column public.appointment_bookings.reason is
  'Motif choisi dans une liste fermée. Ne jamais remplacer par du texte libre : ce champ est visible du personnel et conservé 12 mois.';

-- ─── Rappel de rendez-vous ──────────────────────────────────────────────────
-- Horodatage de l'envoi, pour qu'une exécution répétée de la tâche planifiée
-- n'envoie pas deux fois le même rappel.

alter table public.appointment_bookings
  add column if not exists reminder_sent_at timestamptz;

comment on column public.appointment_bookings.reminder_sent_at is
  'Date d''envoi du rappel de la veille. NULL tant qu''aucun rappel n''a été envoyé.';

create index if not exists appointment_bookings_reminder_idx
  on public.appointment_bookings(reminder_sent_at)
  where reminder_sent_at is null;

-- ─── Réservations créées par l'association ──────────────────────────────────
-- Le personnel prend désormais les rendez-vous pour les adhérents, qui les
-- retrouvent sur leur espace. Tracer qui a créé la réservation permet de
-- distinguer une prise de rendez-vous en ligne d'une saisie au guichet.

alter table public.appointment_bookings
  add column if not exists created_by uuid references auth.users(id) on delete set null;

comment on column public.appointment_bookings.created_by is
  'Membre du personnel ayant saisi la réservation pour le compte de l''adhérent. NULL si la personne a réservé elle-même.';
