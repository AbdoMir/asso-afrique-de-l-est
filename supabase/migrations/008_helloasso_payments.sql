-- ============================================================================
-- Enregistrement des paiements HelloAsso via webhook
-- ============================================================================
-- HelloAsso renvoie deux identifiants distincts dans ses notifications :
--   - data.order.id : la commande (une par panier)
--   - data.id       : le paiement (plusieurs si paiement en plusieurs fois)
--
-- `donations.helloasso_order_id` existait déjà mais ne peut pas servir de clé
-- d'idempotence : deux échéances d'une même commande partagent le même order
-- id et la contrainte UNIQUE ferait échouer la seconde. On indexe donc le
-- paiement, qui est le vrai grain d'un don encaissé.
--
-- HelloAsso réémet une notification tant qu'il ne reçoit pas de 200 : sans
-- cette contrainte, un retard réseau créerait des dons en double.

alter table public.donations
  add column if not exists helloasso_payment_id text;

-- Nettoyage défensif : la contrainte UNIQUE échouerait sur d'éventuels
-- doublons préexistants (aucun attendu, le webhook n'existait pas).
create unique index if not exists donations_helloasso_payment_id_key
  on public.donations(helloasso_payment_id)
  where helloasso_payment_id is not null;

create index if not exists donations_helloasso_order_id_idx
  on public.donations(helloasso_order_id);

create index if not exists memberships_helloasso_ref_idx
  on public.memberships(helloasso_ref);
