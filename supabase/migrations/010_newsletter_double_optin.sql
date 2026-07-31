-- ============================================================================
-- Double opt-in newsletter + restriction de la modification des réservations
-- ============================================================================

-- ─── Double opt-in ──────────────────────────────────────────────────────────
-- L'inscription était immédiate et le consentement auto-déclaré : n'importe
-- qui pouvait inscrire l'adresse d'un tiers, qui recevait alors la newsletter
-- sans jamais l'avoir demandée. Le RGPD attend une preuve de consentement.
--
-- Désormais l'inscription naît « non confirmée » et n'est prise en compte
-- qu'après clic sur le lien envoyé à l'adresse — ce que seul son titulaire
-- peut faire.

alter table public.newsletter_subscribers
  add column if not exists confirmed boolean not null default false;

alter table public.newsletter_subscribers
  add column if not exists confirmation_token uuid default gen_random_uuid();

alter table public.newsletter_subscribers
  add column if not exists confirmed_at timestamptz;

-- Les inscrits existants ont été enregistrés avant la mise en place du double
-- opt-in : les repasser à « non confirmé » reviendrait à les désabonner sans
-- leur demander. On les considère confirmés à leur date d'inscription.
update public.newsletter_subscribers
  set confirmed = true,
      confirmed_at = coalesce(confirmed_at, created_at)
  where confirmed = false
    and confirmed_at is null
    and created_at < now();

create unique index if not exists newsletter_subscribers_token_key
  on public.newsletter_subscribers(confirmation_token)
  where confirmation_token is not null;

comment on column public.newsletter_subscribers.confirmed is
  'Passe à true après clic sur le lien de confirmation. Ne jamais envoyer la newsletter aux lignes non confirmées.';

-- ─── Réservations : n'autoriser que le changement de statut ─────────────────
-- La policy précédente autorisait un adhérent à modifier n'importe quelle
-- colonne de sa réservation (slot_id, notes...), et pas seulement à l'annuler.

revoke update on public.appointment_bookings from authenticated, anon;
grant update (status) on public.appointment_bookings to authenticated;
