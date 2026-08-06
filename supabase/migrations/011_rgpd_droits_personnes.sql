-- ============================================================================
-- RGPD : droit à l'effacement et purge automatique
-- ============================================================================

-- ─── Les reçus fiscaux doivent survivre à la suppression du compte ──────────
-- Un adhérent peut demander l'effacement de ses données (art. 17), mais les
-- reçus fiscaux CERFA relèvent d'une obligation comptable de 6 ans — l'art.
-- 17.3.b réserve précisément ce cas. Or `fiscal_receipts` référençait
-- `profiles` en `on delete cascade` : supprimer un compte détruisait des pièces
-- que l'association est tenue de conserver.
--
-- Le lien vers le compte est donc désormais rompu (`set null`) au lieu d'être
-- suivi, et l'identité strictement nécessaire au CERFA est figée dans
-- `archived_identity` au moment de la suppression.

alter table public.fiscal_receipts
  drop constraint fiscal_receipts_user_id_fkey;

alter table public.fiscal_receipts
  alter column user_id drop not null;

alter table public.fiscal_receipts
  add constraint fiscal_receipts_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete set null;

alter table public.fiscal_receipts
  add column if not exists archived_identity jsonb;

comment on column public.fiscal_receipts.archived_identity is
  'Identité (nom, prénom, adresse, email) figée lors de la suppression du compte. Renseignée uniquement quand user_id est NULL : sans elle, le reçu CERFA conservé au titre de l''obligation comptable ne serait plus rattachable à personne.';

comment on column public.fiscal_receipts.user_id is
  'NULL après suppression du compte par l''adhérent — voir archived_identity.';

-- La contrainte `unique (user_id, year)` reste valide : PostgreSQL considère
-- deux NULL comme distincts, plusieurs reçus orphelins peuvent donc coexister.

-- ─── Index de purge ─────────────────────────────────────────────────────────
-- La tâche planifiée /api/cron/purge balaie ces tables par date de création.

create index if not exists contact_messages_created_at_idx
  on public.contact_messages(created_at);

create index if not exists member_documents_created_at_idx
  on public.member_documents(created_at);

-- ─── Durées de conservation appliquées ──────────────────────────────────────
-- Source de vérité côté code : lib/retention.ts. Ces commentaires rendent le
-- schéma lisible seul, mais toute modification doit partir de ce fichier TS.

comment on table public.contact_messages is
  'Purge automatique après 12 mois (fin du traitement de la demande).';

comment on table public.appointment_slots is
  'Purge automatique 12 mois après le créneau. La suppression cascade sur appointment_bookings.';

comment on table public.member_documents is
  'Documents d''accompagnement administratif — potentiellement sensibles (art. 9). Purge automatique après 24 mois, objets de stockage compris.';

comment on table public.newsletter_subscribers is
  'Inscriptions non confirmées purgées après 7 jours : sans confirmation, aucun consentement n''a été donné. Les inscrits confirmés sont conservés jusqu''à leur désinscription.';
