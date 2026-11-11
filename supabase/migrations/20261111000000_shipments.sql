-- The Jordans — shipments database for the admin dashboard and the public Track page.
--
-- Admins are Supabase Auth users listed in public.admins. Row-level security lets
-- only admins read or change anything. Visitors reach the data through one function,
-- public.track_shipment(code), which returns a single shipment by tracking number
-- without contact details, costs or internal notes.

/* ── Admins ─────────────────────────────────────────────────────────── */
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

/* ── Shipment types (editable list) ─────────────────────────────────── */
create table if not exists public.shipment_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now()
);

insert into public.shipment_types (name)
values ('Air Freight'), ('Ocean Freight'), ('Road Freight'), ('Rail Freight'), ('Express Parcel'), ('Warehousing')
on conflict (name) do nothing;

/* ── Shipments ──────────────────────────────────────────────────────── */
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique check (tracking_number ~ '^[A-Z0-9-]{4,40}$'),
  status text not null default 'Pending' check (status in (
    'Pending', 'Processing', 'Picked Up', 'In Transit', 'Customs Clearance', 'Out for Delivery',
    'Delivered', 'On Hold', 'Delayed', 'Returned', 'Cancelled')),
  -- renaming a type renames it here too; a type in use cannot be deleted
  shipment_type text not null references public.shipment_types (name) on update cascade on delete restrict,
  service_level text not null default 'Standard',
  origin text not null check (length(origin) between 1 and 200),
  destination text not null check (length(destination) between 1 and 200),
  current_location text not null default '',
  progress int not null default 0 check (progress between 0 and 100),
  sender jsonb not null default '{}'::jsonb,
  receiver jsonb not null default '{}'::jsonb,
  description text not null default '',
  quantity int not null default 1 check (quantity >= 0),
  weight_kg numeric check (weight_kg >= 0),
  length_cm numeric check (length_cm >= 0),
  width_cm numeric check (width_cm >= 0),
  height_cm numeric check (height_cm >= 0),
  declared_value numeric check (declared_value >= 0),
  shipping_cost numeric check (shipping_cost >= 0),
  currency text not null default 'USD',
  payment_status text not null default 'Unpaid',
  payment_method text not null default '',
  carrier text not null default '',
  vehicle_ref text not null default '',
  pickup_date date,
  departure_date date,
  estimated_delivery date,
  delivered_date date,
  public_note text not null default '',
  internal_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shipments_updated_idx on public.shipments (updated_at desc);

create table if not exists public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  date timestamptz not null default now(),
  status text not null check (status in (
    'Pending', 'Processing', 'Picked Up', 'In Transit', 'Customs Clearance', 'Out for Delivery',
    'Delivered', 'On Hold', 'Delayed', 'Returned', 'Cancelled')),
  location text not null default '',
  note text not null default ''
);

create index if not exists shipment_events_idx on public.shipment_events (shipment_id, date desc);

/* ── Triggers ───────────────────────────────────────────────────────── */

-- Tracking numbers: uppercase, no spaces; blank = generate TJ-<year>-<7 chars>.
create or replace function public.shipments_before_write()
returns trigger language plpgsql as $$
declare
  chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
begin
  new.tracking_number := upper(regexp_replace(coalesce(new.tracking_number, ''), '\s', '', 'g'));
  if tg_op = 'UPDATE' and new.tracking_number = '' then
    new.tracking_number := old.tracking_number;
  end if;
  if new.tracking_number = '' then
    loop
      candidate := 'TJ-' || to_char(now(), 'YYYY') || '-';
      for i in 1..7 loop
        candidate := candidate || substr(chars, 1 + floor(random() * length(chars))::int, 1);
      end loop;
      exit when not exists (select 1 from public.shipments where tracking_number = candidate);
    end loop;
    new.tracking_number := candidate;
  end if;
  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists shipments_before_write on public.shipments;
create trigger shipments_before_write before insert or update on public.shipments
  for each row execute function public.shipments_before_write();

-- History: one entry on creation, one whenever an admin changes the status in the form.
create or replace function public.shipments_after_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.shipment_events (shipment_id, status, location, note)
    values (new.id, new.status, coalesce(nullif(new.current_location, ''), new.origin), 'Shipment created');
  elsif new.status is distinct from old.status and pg_trigger_depth() = 1 then
    -- depth 1 = edited directly (depth 2 = moved by posting a tracking update below)
    insert into public.shipment_events (shipment_id, status, location, note)
    values (new.id, new.status, new.current_location, 'Status updated to ' || new.status);
  end if;
  return null;
end;
$$;

drop trigger if exists shipments_after_write on public.shipments;
create trigger shipments_after_write after insert or update on public.shipments
  for each row execute function public.shipments_after_write();

-- Default progress (%) for a status; null = keep the current value. Mirrors STATUS_PROGRESS in src/lib/types.ts.
create or replace function public.status_progress(p_status text)
returns int language sql immutable as $$
  select case p_status
    when 'Pending' then 0 when 'Processing' then 10 when 'Picked Up' then 25 when 'In Transit' then 50
    when 'Customs Clearance' then 65 when 'Out for Delivery' then 85 when 'Delivered' then 100
    else null end;
$$;

-- Posting a tracking update that is the newest entry moves the shipment to it.
create or replace function public.events_after_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if pg_trigger_depth() = 1 and not exists (
    select 1 from public.shipment_events
    where shipment_id = new.shipment_id and id <> new.id and date > new.date
  ) then
    update public.shipments
       set status = new.status,
           current_location = coalesce(nullif(new.location, ''), current_location),
           progress = coalesce(public.status_progress(new.status), progress),
           delivered_date = case when new.status = 'Delivered' then coalesce(delivered_date, new.date::date) else delivered_date end
     where id = new.shipment_id;
  end if;
  return null;
end;
$$;

drop trigger if exists events_after_insert on public.shipment_events;
create trigger events_after_insert after insert on public.shipment_events
  for each row execute function public.events_after_insert();

/* ── Security ───────────────────────────────────────────────────────── */
alter table public.admins enable row level security;
alter table public.shipment_types enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_events enable row level security;

drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select using (user_id = auth.uid());

drop policy if exists types_admin on public.shipment_types;
create policy types_admin on public.shipment_types for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists shipments_admin on public.shipments;
create policy shipments_admin on public.shipments for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists events_admin on public.shipment_events;
create policy events_admin on public.shipment_events for all using (public.is_admin()) with check (public.is_admin());

/* ── Public tracking lookup ─────────────────────────────────────────── */
create or replace function public.track_shipment(p_code text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'tracking_number', s.tracking_number,
    'status', s.status,
    'shipment_type', s.shipment_type,
    'service_level', s.service_level,
    'origin', s.origin,
    'destination', s.destination,
    'current_location', s.current_location,
    'progress', s.progress,
    'sender_name', coalesce(s.sender ->> 'name', ''),
    'receiver_name', coalesce(s.receiver ->> 'name', ''),
    'description', s.description,
    'quantity', s.quantity,
    'weight_kg', s.weight_kg,
    'dimensions', case when s.length_cm > 0 and s.width_cm > 0 and s.height_cm > 0
                       then s.length_cm || ' × ' || s.width_cm || ' × ' || s.height_cm || ' cm' else '' end,
    'pickup_date', coalesce(s.pickup_date::text, ''),
    'departure_date', coalesce(s.departure_date::text, ''),
    'estimated_delivery', coalesce(s.estimated_delivery::text, ''),
    'delivered_date', coalesce(s.delivered_date::text, ''),
    'public_note', s.public_note,
    'updated_at', s.updated_at,
    'events', coalesce((
      select json_agg(json_build_object('date', e.date, 'status', e.status, 'location', e.location, 'note', e.note)
                      order by e.date desc)
      from public.shipment_events e where e.shipment_id = s.id), '[]'::json)
  )
  from public.shipments s
  where s.tracking_number = upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
$$;

revoke all on function public.track_shipment(text) from public;
grant execute on function public.track_shipment(text) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;
