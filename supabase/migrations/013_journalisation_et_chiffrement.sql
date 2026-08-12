-- ============================================================================
-- Journalisation des accès et chiffrement applicatif des documents
-- ============================================================================

-- ─── TABLE: audit_log ───────────────────────────────────────────────────────
-- Jusqu'ici, rien ne permettait de savoir qui avait consulté quoi. En cas de
-- soupçon de fuite, l'association ne pouvait ni identifier l'origine, ni
-- démontrer que les accès étaient légitimes — deux exigences du principe de
-- responsabilité (art. 5.2) et de la sécurité du traitement (art. 32).
--
-- Deux familles d'événements y sont consignées :
--   - les actions du personnel sur les données des adhérents ;
--   - les accès aux documents déposés, qui relèvent potentiellement de
--     l'art. 9 et méritent une traçabilité même quand c'est leur propriétaire
--     qui les consulte.

create table public.audit_log (
  id            uuid default uuid_generate_v4() primary key,
  -- L'auteur peut disparaître (droit à l'effacement) sans que la trace de
  -- l'action ne perde son sens : on conserve l'email, figé au moment des faits.
  actor_id      uuid references auth.users(id) on delete set null,
  actor_email   text,
  actor_role    text not null check (actor_role in ('staff', 'member', 'system')),
  action        text not null,
  resource_type text,
  resource_id   text,
  metadata      jsonb,
  ip            text,
  created_at    timestamptz default now() not null
);

alter table public.audit_log enable row level security;

-- Aucune policy pour `authenticated` : un journal d'accès consultable par ceux
-- qu'il surveille n'aurait aucune valeur probante. La lecture se fait via
-- Supabase Studio, avec le rôle de service.
create policy "Service role can manage audit log"
  on public.audit_log for all
  using ((select auth.role()) = 'service_role');

create index audit_log_created_at_idx on public.audit_log(created_at desc);
create index audit_log_actor_id_idx on public.audit_log(actor_id);
create index audit_log_resource_idx on public.audit_log(resource_type, resource_id);

comment on table public.audit_log is
  'Journal des accès aux données personnelles. Purge automatique après 12 mois, conformément à la recommandation CNIL sur la durée de conservation des journaux (6 mois à 1 an).';

-- ─── Chiffrement applicatif des documents ───────────────────────────────────
-- Les documents des adhérents (titres de séjour, pièces administratives) ne
-- reposaient que sur le chiffrement au repos de l'hébergeur et sur le
-- cloisonnement RLS. Ils sont désormais chiffrés par l'application avant
-- l'envoi : quiconque obtiendrait le contenu brut du bucket — clé détournée,
-- incident chez l'hébergeur, sauvegarde égarée — n'y trouverait que du
-- chiffré, la clé vivant hors de la base.
--
-- L'indicateur ci-dessous permet aux documents déjà déposés de rester
-- téléchargeables : ils resteront en clair jusqu'à leur remplacement.

alter table public.member_documents
  add column if not exists encrypted boolean not null default false;

comment on column public.member_documents.encrypted is
  'true si l''objet de stockage est chiffré en AES-256-GCM par l''application. Les documents antérieurs au 11 août 2026 sont en clair.';
