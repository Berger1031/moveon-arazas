-- Move-ON Árazás – database schema for cloud mode.
-- Derived from the columns the app reads and writes (src/logic.js: SbStore, moveToRow, rowToMove).
-- Run once in the Supabase SQL editor of a project dedicated to this app.

create table if not exists public.pricing_versions (
  id uuid primary key default gen_random_uuid(),
  version_no integer not null unique,
  config jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pricing_changes (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.pricing_versions (id) on delete cascade,
  item text not null,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.custom_fields (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  field_type text not null check (field_type in ('num', 'bool', 'text')),
  unit text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.moves (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'new' check (source in ('new', 'old')),
  move_date date,
  location text not null default 'bp',
  distance_km numeric,
  package_id text,
  package_note text,
  workers numeric,
  hours numeric,
  total_min numeric,
  travel_min numeric,
  from_floor numeric,
  from_lift boolean,
  to_floor numeric,
  to_lift boolean,
  box_min numeric,
  box_max numeric,
  boxes numeric,
  small_furniture numeric,
  large_furniture numeric,
  furniture numeric,
  heavy numeric,
  heavy_note text,
  extras text,
  unusual text,
  final_price numeric,
  price_type text not null default 'netto' check (price_type in ('netto', 'brutto')),
  custom_values jsonb not null default '{}'::jsonb,
  note text,
  pricing_version_id uuid references public.pricing_versions (id) on delete set null,
  pricing_snapshot jsonb,
  -- Fingerprint of an imported Excel row; the import upserts on it so a row is never loaded twice.
  legacy_id text unique,
  is_demo boolean not null default false,
  is_example boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Only signed-in users may read or write. The anon key alone gives no access.
alter table public.pricing_versions enable row level security;
alter table public.pricing_changes enable row level security;
alter table public.custom_fields enable row level security;
alter table public.moves enable row level security;

create policy "authenticated full access" on public.pricing_versions for all to authenticated using (true) with check (true);
create policy "authenticated full access" on public.pricing_changes for all to authenticated using (true) with check (true);
create policy "authenticated full access" on public.custom_fields for all to authenticated using (true) with check (true);
create policy "authenticated full access" on public.moves for all to authenticated using (true) with check (true);

-- Live sync between open browsers.
alter publication supabase_realtime add table public.moves, public.custom_fields, public.pricing_versions;

-- Ordered list of a job's addresses: [{"floor": 3, "lift": false, "walk": "near", "travel_min": null}, ...].
-- walk is the truck-to-entrance loading distance (door | near | mid | far | vfar, or null when unknown).
-- travel_min is the journey from the previous address (null for the first). The from_*/to_* columns
-- mirror the first and last address, and moves.travel_min holds the sum of all journeys.
alter table public.moves add column if not exists stops jsonb;
