-- ============================================================================
-- Corrections issues du Security/Performance Advisor Supabase
-- ============================================================================

-- Fix security_definer_view (ERROR) : ces vues filtrent déjà par auth.uid()
-- mais sans security_invoker elles s'exécutent avec les droits du propriétaire,
-- ce qui contourne RLS comme filet de sécurité en cas de modification future.
alter view public.member_summary set (security_invoker = true);
alter view public.impact_stats set (security_invoker = true);

-- Fix function_search_path_mutable (WARN) : search_path explicite pour
-- éviter le risque de "schema squatting" sur des fonctions SECURITY DEFINER.
alter function public.handle_new_user() set search_path = public;
alter function public.handle_updated_at() set search_path = public;

-- Fix anon/authenticated_security_definer_function_executable (WARN) :
-- handle_new_user n'est qu'un trigger, jamais censé être appelé via l'API REST.
-- PUBLIC est la grantee racine en Postgres : un revoke ciblé sur anon/authenticated
-- ne suffit pas, ils en héritent automatiquement tant que PUBLIC garde EXECUTE.
revoke execute on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to service_role;

-- Fix auth_rls_initplan (perf) : (select auth.uid()) évite la ré-évaluation
-- de la fonction pour chaque ligne, recommandé par Supabase à grande échelle.
drop policy "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);

drop policy "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

drop policy "Users can view their own memberships" on public.memberships;
create policy "Users can view their own memberships"
  on public.memberships for select
  using ((select auth.uid()) = user_id);

drop policy "Service role can manage memberships" on public.memberships;
create policy "Service role can manage memberships"
  on public.memberships for all
  using ((select auth.role()) = 'service_role');

drop policy "Users can view their own donations" on public.donations;
create policy "Users can view their own donations"
  on public.donations for select
  using ((select auth.uid()) = user_id);

drop policy "Service role can manage donations" on public.donations;
create policy "Service role can manage donations"
  on public.donations for all
  using ((select auth.role()) = 'service_role');

drop policy "Users can view their own fiscal receipts" on public.fiscal_receipts;
create policy "Users can view their own fiscal receipts"
  on public.fiscal_receipts for select
  using ((select auth.uid()) = user_id);

drop policy "Service role can manage fiscal receipts" on public.fiscal_receipts;
create policy "Service role can manage fiscal receipts"
  on public.fiscal_receipts for all
  using ((select auth.role()) = 'service_role');

drop policy "Only service role can manage newsletter" on public.newsletter_subscribers;
create policy "Only service role can manage newsletter"
  on public.newsletter_subscribers for all
  using ((select auth.role()) = 'service_role');

drop policy "Only service role can manage contact messages" on public.contact_messages;
create policy "Only service role can manage contact messages"
  on public.contact_messages for all
  using ((select auth.role()) = 'service_role');

-- Fix unindexed_foreign_keys (perf)
create index if not exists donations_membership_id_idx on public.donations(membership_id);
