-- ============================================================================
-- Documents administratifs des adhérents (hors données de santé)
-- ============================================================================

create table public.member_documents (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  file_name     text not null,
  storage_path  text not null,
  mime_type     text not null,
  size_bytes    integer not null,
  label         text,
  created_at    timestamptz default now() not null
);

alter table public.member_documents enable row level security;

create policy "Users can view their own documents"
  on public.member_documents for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own documents"
  on public.member_documents for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own documents"
  on public.member_documents for delete
  using ((select auth.uid()) = user_id);

create policy "Service role can manage member documents"
  on public.member_documents for all
  using ((select auth.role()) = 'service_role');

create index member_documents_user_id_idx on public.member_documents(user_id);

-- ─── STORAGE: member-documents ─────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('member-documents', 'member-documents', false);

create policy "Users can manage their own documents storage"
  on storage.objects for all
  using (
    bucket_id = 'member-documents'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Service role can manage member documents storage"
  on storage.objects for all
  using (
    bucket_id = 'member-documents'
    and (select auth.role()) = 'service_role'
  );
