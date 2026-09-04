-- ============================================================================
-- Passage à Stripe et émission des reçus fiscaux par l'association
-- ============================================================================
-- L'association quitte HelloAsso pour Stripe. Le schéma anticipait déjà les
-- deux besoins :
--
--   — les colonnes Stripe existent depuis la migration 001
--     (`stripe_payment_intent_id`, `stripe_subscription_id`,
--     `stripe_customer_id`), et `payment_method` connaît déjà `card` et
--     `sepa_debit` depuis la 002 ;
--   — la table `fiscal_receipts` existe elle aussi depuis la 001, avec sa
--     contrainte d'un reçu par adhérent et par exercice, et la migration 011
--     l'a déjà rendue capable de survivre à la suppression d'un compte
--     (art. 17.3.b : obligation comptable de 6 ans).
--
-- Cette migration ne crée donc aucune table de reçus. Il ne manquait que deux
-- choses pour qu'une émission par nos soins soit possible.
--
-- 1. L'adresse du donateur. Le CERFA l'exige, et `donations` ne portait que le
--    nom et l'email : HelloAsso détenait le reste.
-- 2. De quoi numéroter. `fiscal_receipts.cerfa_number` est `unique not null`,
--    mais rien ne l'attribuait — HelloAsso s'en chargeait.
--
-- Les colonnes `helloasso_*` et la valeur `helloasso` de l'énumération sont
-- conservées : les dons déjà encaissés restent en base pour la comptabilité,
-- et une migration ne réécrit pas l'histoire.

-- ─── Adresse du donateur ────────────────────────────────────────────────────
-- Stripe Checkout la collecte pour nous (`billing_address_collection:
-- 'required'`), et le webhook la dépose ici.
--
-- C'est aussi ce qui rend le reçu reproductible sans figer une identité
-- supplémentaire : une ligne de don ne change jamais, alors qu'un profil suit
-- les déménagements. Le reçu se compose à partir des dons qu'il agrège, donc
-- de l'adresse qui était celle du donateur au moment où il a donné.

alter table public.donations
  add column if not exists donor_address text,
  add column if not exists donor_city text,
  add column if not exists donor_zip_code text;

comment on column public.donations.donor_address is
  'Adresse du donateur au moment du versement, collectée par Stripe Checkout. Nécessaire au reçu fiscal CERFA — sans elle, le reçu est irrégulier et la déduction contestable.';

-- ─── Numérotation des reçus ─────────────────────────────────────────────────
-- Un reçu fiscal porte un numéro d'ordre dans une série continue. Une séquence
-- Postgres ne convient pas : elle laisse des trous au moindre rollback, et un
-- trou dans une série de reçus est exactement ce qu'un contrôle regarde.
--
-- Une ligne par exercice, incrémentée dans la transaction qui insère le reçu.
-- Le verrou de ligne d'`on conflict do update` sérialise les émissions
-- concurrentes : deux reçus ne peuvent pas recevoir le même numéro.

create table if not exists public.fiscal_receipt_counters (
  year         smallint primary key,
  last_number  integer not null default 0
);

alter table public.fiscal_receipt_counters enable row level security;

-- Aucune politique pour les adhérents : ce compteur ne regarde que le rôle de
-- service. RLS active sans politique correspondante = table fermée.
create policy "Service role can manage receipt counters"
  on public.fiscal_receipt_counters for all
  using ((select auth.role()) = 'service_role');

comment on table public.fiscal_receipt_counters is
  'Dernier numéro de reçu attribué par exercice. Alimente next_cerfa_number().';

create or replace function public.next_cerfa_number(annee smallint)
returns text as $$
declare
  numero integer;
begin
  insert into public.fiscal_receipt_counters (year, last_number)
  values (annee, 1)
  on conflict (year)
    do update set last_number = public.fiscal_receipt_counters.last_number + 1
  returning last_number into numero;

  return annee::text || '-' || lpad(numero::text, 4, '0');
end;
$$ language plpgsql security definer set search_path = public;

-- Fonction interne : jamais exposée via /rest/v1/rpc (cf. migration 012).
-- Un appel libre permettrait de brûler des numéros et de trouer la série.
revoke execute on function public.next_cerfa_number(smallint) from public, anon, authenticated;

comment on function public.next_cerfa_number(smallint) is
  'Attribue le prochain numéro de reçu de l''exercice, au format AAAA-NNNN. Atomique : le verrou de ligne du compteur sérialise les émissions concurrentes.';

-- ─── Le PDF n'est pas stocké ────────────────────────────────────────────────
-- `fiscal_receipts.pdf_url` restera NULL. Le bureau a supprimé tout dépôt de
-- fichiers en août 2026 (migration 014), au motif qu'une donnée non détenue ne
-- peut ni fuiter ni être oubliée dans une sauvegarde. Le reçu est reconstruit
-- à l'identique à chaque téléchargement depuis la ligne et les dons qu'elle
-- agrège : le rendu est déterministe, la colonne devient inutile.

comment on column public.fiscal_receipts.pdf_url is
  'Inutilisée depuis la migration 016 : aucun PDF n''est stocké. Le reçu est regénéré à la demande depuis donation_ids. Conservée pour ne pas casser les types existants.';
