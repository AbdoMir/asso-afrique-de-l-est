-- ============================================================================
-- Ajout des modes de paiement (CB, SEPA, PayPal, virement, espèces/chèque)
-- ============================================================================

create type payment_method as enum (
  'card',
  'sepa_debit',
  'paypal',
  'bank_transfer',
  'cash_check',
  'helloasso'
);

alter table public.donations
  add column payment_method payment_method;

alter table public.memberships
  add column payment_method payment_method;

comment on column public.donations.payment_method is
  'Moyen de paiement utilisé. NULL pour les dons historiques antérieurs à cette colonne.';
comment on column public.memberships.payment_method is
  'Moyen de paiement utilisé pour l''adhésion/abonnement.';
