-- ============================================================================
-- Durcissement sécurité : fonctions internes et limites de stockage
-- ============================================================================
-- Écarts relevés par le linter Supabase et l'audit d'architecture du 6 août
-- 2026 (voir docs/RGPD.md § 8).

-- ─── Fonctions internes retirées de l'API publique ──────────────────────────
-- PostgREST expose automatiquement les fonctions du schéma `public` sur
-- /rest/v1/rpc/<nom>. Ces deux-là sont des rouages internes : l'une est une
-- fonction de trigger, l'autre un utilitaire d'administration. Étant en
-- `security definer`, elles s'exécutent avec les droits de leur propriétaire —
-- les laisser appelables par `anon` revient à offrir un point d'entrée
-- privilégié à des visiteurs non authentifiés.
--
-- Le `revoke` ne gêne pas leur usage réel : un trigger n'appelle pas sa
-- fonction via l'API REST, il l'exécute dans le moteur.
--
-- La révocation doit viser `public` : PostgreSQL accorde EXECUTE à ce
-- pseudo-rôle à la création de toute fonction, et `anon` comme `authenticated`
-- en héritent. Révoquer sur ces deux rôles seuls ne retire rien — c'est déjà ce
-- qu'avait corrigé la migration `revoke_handle_new_user_public_execute`.

revoke execute on function public.check_appointment_capacity() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

comment on function public.check_appointment_capacity() is
  'Fonction de trigger : vérifie la capacité d''un créneau avant insertion. Ne doit jamais être exposée via /rest/v1/rpc.';

-- ─── Limites côté serveur sur les buckets ───────────────────────────────────
-- La taille et le type des fichiers étaient vérifiés uniquement dans
-- app/api/documents/upload/route.ts. Cette validation reste la première
-- barrière, mais elle vit dans le code applicatif : un jeton détourné qui
-- écrirait directement dans le Storage la contournerait entièrement.
--
-- Les mêmes règles sont donc posées dans la base, où rien ne peut les éviter.
-- Valeurs alignées sur lib/file-validation.ts : toute modification doit être
-- répercutée des deux côtés.

update storage.buckets
set file_size_limit = 4194304, -- 4 Mo, cf. MAX_DOCUMENT_SIZE_BYTES
    allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
where id = 'member-documents';

-- Les reçus fiscaux sont des PDF générés par l'association, jamais téléversés
-- par un adhérent : le type est donc strictement limité.
update storage.buckets
set file_size_limit = 10485760, -- 10 Mo
    allowed_mime_types = array['application/pdf']
where id = 'fiscal-receipts';
