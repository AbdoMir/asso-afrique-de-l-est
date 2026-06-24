-- ============================================================================
-- Association Afrique de l'Est et ses amis — Schéma de base de données
-- ============================================================================

-- Extension UUID
create extension if not exists "uuid-ossp";

-- ─── TABLE: profiles ──────────────────────────────────────────────────────────
-- Extension de auth.users avec les données personnelles des adhérents

create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  first_name  text not null default '',
  last_name   text not null default '',
  phone       text,
  address     text,
  city        text,
  zip_code    text,
  country     text default 'FR',
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Row Level Security
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ─── TABLE: memberships ───────────────────────────────────────────────────────

create type membership_type as enum ('simple', 'monthly_5', 'monthly_10', 'monthly_20');
create type membership_status as enum ('active', 'expired', 'cancelled', 'pending');
create type donation_frequency as enum ('once', 'monthly');

create table public.memberships (
  id                      uuid default uuid_generate_v4() primary key,
  user_id                 uuid references public.profiles(id) on delete cascade not null,
  type                    membership_type not null,
  status                  membership_status default 'pending' not null,
  amount                  numeric(10,2) not null,
  frequency               donation_frequency not null,
  helloasso_ref           text,
  stripe_subscription_id  text unique,
  stripe_customer_id      text,
  date_start              date default current_date not null,
  date_end                date,
  created_at              timestamptz default now() not null,
  updated_at              timestamptz default now() not null
);

alter table public.memberships enable row level security;

create policy "Users can view their own memberships"
  on public.memberships for select
  using (auth.uid() = user_id);

create policy "Service role can manage memberships"
  on public.memberships for all
  using (auth.role() = 'service_role');

create trigger memberships_updated_at
  before update on public.memberships
  for each row execute procedure public.handle_updated_at();

-- Index
create index memberships_user_id_idx on public.memberships(user_id);
create index memberships_stripe_sub_idx on public.memberships(stripe_subscription_id);

-- ─── TABLE: donations ─────────────────────────────────────────────────────────

create type donation_status as enum ('pending', 'succeeded', 'failed', 'refunded', 'cancelled');

create table public.donations (
  id                        uuid default uuid_generate_v4() primary key,
  user_id                   uuid references public.profiles(id) on delete set null,
  amount                    numeric(10,2) not null,
  frequency                 donation_frequency not null default 'once',
  status                    donation_status default 'pending' not null,
  stripe_payment_intent_id  text unique,
  stripe_subscription_id    text,
  helloasso_order_id        text unique,
  donor_name                text,
  donor_email               text,
  membership_id             uuid references public.memberships(id),
  created_at                timestamptz default now() not null,
  updated_at                timestamptz default now() not null
);

alter table public.donations enable row level security;

create policy "Users can view their own donations"
  on public.donations for select
  using (auth.uid() = user_id);

create policy "Service role can manage donations"
  on public.donations for all
  using (auth.role() = 'service_role');

create trigger donations_updated_at
  before update on public.donations
  for each row execute procedure public.handle_updated_at();

create index donations_user_id_idx on public.donations(user_id);
create index donations_stripe_pi_idx on public.donations(stripe_payment_intent_id);
create index donations_created_at_idx on public.donations(created_at);

-- ─── TABLE: fiscal_receipts ───────────────────────────────────────────────────

create table public.fiscal_receipts (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  donation_ids  uuid[] not null,
  year          smallint not null,
  total_amount  numeric(10,2) not null,
  cerfa_number  text unique not null,
  pdf_url       text,
  sent_at       timestamptz,
  created_at    timestamptz default now() not null,
  constraint unique_receipt_per_user_year unique (user_id, year)
);

alter table public.fiscal_receipts enable row level security;

create policy "Users can view their own fiscal receipts"
  on public.fiscal_receipts for select
  using (auth.uid() = user_id);

create policy "Service role can manage fiscal receipts"
  on public.fiscal_receipts for all
  using (auth.role() = 'service_role');

create index fiscal_receipts_user_id_idx on public.fiscal_receipts(user_id);
create index fiscal_receipts_year_idx on public.fiscal_receipts(year);

-- ─── TABLE: newsletter_subscribers ───────────────────────────────────────────

create table public.newsletter_subscribers (
  id          uuid default uuid_generate_v4() primary key,
  email       text unique not null,
  first_name  text,
  consent     boolean default true not null,
  created_at  timestamptz default now() not null
);

alter table public.newsletter_subscribers enable row level security;

create policy "Only service role can manage newsletter"
  on public.newsletter_subscribers for all
  using (auth.role() = 'service_role');

-- ─── TABLE: contact_messages ──────────────────────────────────────────────────

create table public.contact_messages (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  read        boolean default false not null,
  created_at  timestamptz default now() not null
);

alter table public.contact_messages enable row level security;

create policy "Only service role can manage contact messages"
  on public.contact_messages for all
  using (auth.role() = 'service_role');

-- ─── STORAGE: fiscal-receipts ─────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('fiscal-receipts', 'fiscal-receipts', false);

create policy "Users can access their own receipts"
  on storage.objects for select
  using (
    bucket_id = 'fiscal-receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Service role can manage receipts storage"
  on storage.objects for all
  using (
    bucket_id = 'fiscal-receipts'
    and auth.role() = 'service_role'
  );

-- ─── VIEWS ────────────────────────────────────────────────────────────────────

-- Vue récapitulatif adhérent pour le dashboard
create view public.member_summary as
select
  p.id,
  p.first_name,
  p.last_name,
  p.email,
  m.type as membership_type,
  m.status as membership_status,
  m.amount as membership_amount,
  m.frequency,
  m.date_start,
  m.date_end,
  m.stripe_subscription_id,
  coalesce(sum(d.amount) filter (where d.status = 'succeeded'), 0) as total_donated,
  count(d.id) filter (where d.status = 'succeeded') as donation_count,
  max(fr.year) as last_receipt_year
from public.profiles p
left join public.memberships m on m.user_id = p.id and m.status = 'active'
left join public.donations d on d.user_id = p.id
left join public.fiscal_receipts fr on fr.user_id = p.id
where p.id = auth.uid()
group by p.id, p.first_name, p.last_name, p.email, 
         m.type, m.status, m.amount, m.frequency, m.date_start, m.date_end, m.stripe_subscription_id;

-- Vue statistiques d'impact (publique)
create view public.impact_stats as
select
  count(distinct m.user_id) filter (where m.status = 'active') as active_members,
  coalesce(sum(d.amount) filter (where d.status = 'succeeded'), 0) as total_raised,
  count(d.id) filter (where d.status = 'succeeded' and d.frequency = 'monthly') as monthly_donors,
  count(distinct extract(year from d.created_at)) as years_active
from public.memberships m
full outer join public.donations d on d.user_id = m.user_id;
