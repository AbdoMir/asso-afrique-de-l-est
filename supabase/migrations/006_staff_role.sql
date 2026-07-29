-- ============================================================================
-- Rôle staff : autorise certains adhérents à gérer les RDV depuis le site
-- ============================================================================

alter table public.profiles add column is_staff boolean not null default false;

-- Note : voir 007_staff_role_column_grants_fix.sql — cette première tentative
-- de verrouillage (revoke au niveau colonne) s'est révélée insuffisante et a
-- été corrigée juste après.
revoke update (is_staff) on public.profiles from authenticated, anon;

-- Défense en profondeur : le staff peut lire toutes les réservations directement
-- (en plus du contournement RLS déjà utilisé par les routes admin via service_role).
create policy "Staff can view all bookings"
  on public.appointment_bookings for select
  using (exists (
    select 1 from public.profiles where id = (select auth.uid()) and is_staff = true
  ));
