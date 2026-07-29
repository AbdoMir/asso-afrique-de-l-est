-- ============================================================================
-- Corrige le verrouillage de is_staff (006_staff_role.sql)
-- ============================================================================
-- Le `revoke update (is_staff) ... from authenticated` de la migration
-- précédente ne bloquait rien : Supabase accorde UPDATE sur TOUTE la table
-- `profiles` à `authenticated` par défaut, et un revoke au niveau colonne ne
-- peut pas annuler un grant au niveau table en PostgreSQL (vérifié : un
-- adhérent authentifié pouvait toujours passer is_staff à true via un simple
-- update depuis le navigateur).
--
-- Correction : retirer le grant table entière, puis ne réaccorder que les
-- colonnes que l'app modifie réellement (cf. handleUpdateProfile dans
-- app/espace-adherent/page.tsx). is_staff, email, id, created_at/updated_at
-- restent hors de portée d'un update direct par un adhérent.

revoke update on public.profiles from authenticated, anon;
grant update (first_name, last_name, phone, address, city, zip_code) on public.profiles to authenticated;
