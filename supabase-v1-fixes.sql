-- Utsavkosh V1 compatibility fix for existing database constraints.
-- Safe to run once in Supabase SQL Editor; does not drop tables or rows.
begin;

-- Existing bookings table requires event_name. The form now collects it explicitly.
alter table public.bookings
  add column if not exists event_name text;

-- Existing package_items schema requires item_id. The UI now selects this exact field.
alter table public.package_items
  add column if not exists item_id uuid,
  add column if not exists inventory_item_id uuid;

-- Booking item schemas can use the same legacy item_id name; keep both app aliases supported.
alter table public.booking_items
  add column if not exists item_id uuid,
  add column if not exists inventory_item_id uuid;

-- Backfill legacy aliases where data is available. No values are invented for item IDs.
update public.package_items
set item_id = inventory_item_id
where item_id is null and inventory_item_id is not null;

update public.booking_items
set item_id = inventory_item_id
where item_id is null and inventory_item_id is not null;

-- Reload PostgREST's schema cache so new/verified columns are visible to the API.
commit;
notify pgrst, 'reload schema';
