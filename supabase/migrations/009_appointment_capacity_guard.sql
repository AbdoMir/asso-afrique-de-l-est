-- ============================================================================
-- Empêche la surréservation des créneaux de rendez-vous
-- ============================================================================
-- L'API comptait les réservations puis insérait (app/api/rendez-vous/route.ts).
-- Entre les deux, rien n'empêchait une seconde requête de passer le même
-- contrôle : deux personnes pouvaient réserver la dernière place d'un créneau.
--
-- La vérification est déplacée en base, seul endroit où elle peut être
-- atomique. `for update` sur la ligne du créneau sérialise les insertions
-- concurrentes portant sur ce créneau — la seconde attend puis recompte, et
-- voit alors la réservation de la première.

create or replace function public.check_appointment_capacity()
returns trigger as $$
declare
  slot_capacity integer;
  confirmed_count integer;
begin
  -- Ne concerne que les réservations actives : une annulation libère la place.
  if new.status is distinct from 'confirmed' then
    return new;
  end if;

  -- Verrou sur le créneau : les requêtes concurrentes sur ce même créneau
  -- s'exécutent l'une après l'autre jusqu'à la fin de la transaction.
  select capacity into slot_capacity
  from public.appointment_slots
  where id = new.slot_id
  for update;

  if slot_capacity is null then
    raise exception 'Créneau introuvable' using errcode = 'no_data_found';
  end if;

  select count(*) into confirmed_count
  from public.appointment_bookings
  where slot_id = new.slot_id
    and status = 'confirmed'
    and (tg_op = 'INSERT' or id <> new.id);

  if confirmed_count >= slot_capacity then
    raise exception 'Ce créneau est complet.' using errcode = 'check_violation';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists appointment_bookings_capacity on public.appointment_bookings;

create trigger appointment_bookings_capacity
  before insert or update of status, slot_id on public.appointment_bookings
  for each row execute procedure public.check_appointment_capacity();

-- Une capacité nulle ou négative viderait le contrôle de son sens (la route
-- admin acceptait n'importe quelle valeur JSON, cf. 010).
alter table public.appointment_slots
  drop constraint if exists appointment_slots_capacity_positive;

alter table public.appointment_slots
  add constraint appointment_slots_capacity_positive check (capacity > 0);

alter table public.appointment_slots
  drop constraint if exists appointment_slots_end_after_start;

alter table public.appointment_slots
  add constraint appointment_slots_end_after_start check (end_at > start_at);

create index if not exists appointment_bookings_slot_status_idx
  on public.appointment_bookings(slot_id, status);
