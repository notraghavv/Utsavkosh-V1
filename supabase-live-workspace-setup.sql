-- Utsavkosh live workspace setup
-- Run once in Supabase SQL Editor. It adds fields used by the live CRUD UI,
-- grants the authenticated app role table access, and applies owner-scoped RLS
-- to business data tables. It does not delete any rows or recreate tables.

begin;

-- Business registration fields used by the current registration form.
alter table public.businesses
  add column if not exists owner_name text,
  add column if not exists logo_url text,
  add column if not exists business_type text,
  add column if not exists description text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists postal_code text,
  add column if not exists pincode text,
  add column if not exists country text default 'India',
  add column if not exists timezone text default 'Asia/Kolkata',
  add column if not exists date_format text default 'DD MMM YYYY',
  add column if not exists quotation_prefix text default 'QT',
  add column if not exists invoice_prefix text default 'INV',
  add column if not exists tax_enabled boolean default false,
  add column if not exists tax_rate numeric(5,2),
  add column if not exists allow_custom_items boolean default true;

-- Common identity and ownership fields. Existing columns are left unchanged.
do $$
declare t text;
begin
  foreach t in array array[
    'customers','enquiries','inventory_items','packages','package_items',
    'bookings','booking_items','invoices','invoice_items','payments','vendors','tasks'
  ] loop
    execute format('alter table public.%I add column if not exists id uuid default gen_random_uuid()', t);
    execute format('alter table public.%I add column if not exists business_id uuid', t);
    execute format('alter table public.%I add column if not exists created_at timestamptz default now()', t);
    execute format('alter table public.%I add column if not exists updated_at timestamptz default now()', t);
  end loop;
end $$;

-- Customer records
alter table public.customers
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists notes text,
  add column if not exists status text default 'Active';

-- Enquiries / leads
alter table public.enquiries
  add column if not exists customer_id uuid,
  add column if not exists customer_name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists event_type text,
  add column if not exists event_date date,
  add column if not exists venue text,
  add column if not exists budget numeric(12,2),
  add column if not exists status text default 'New',
  add column if not exists source text,
  add column if not exists follow_up_date date,
  add column if not exists notes text;

-- Inventory / item catalogue
alter table public.inventory_items
  add column if not exists name text,
  add column if not exists sku text,
  add column if not exists category text,
  add column if not exists unit text,
  add column if not exists quantity numeric(12,2) default 0,
  add column if not exists price numeric(12,2) default 0,
  add column if not exists cost numeric(12,2) default 0,
  add column if not exists status text default 'Active',
  add column if not exists description text;

-- Packages and package lines
alter table public.packages
  add column if not exists name text,
  add column if not exists code text,
  add column if not exists event_type text,
  add column if not exists price numeric(12,2) default 0,
  add column if not exists status text default 'Active',
  add column if not exists customizable boolean default true,
  add column if not exists description text;

alter table public.package_items
  add column if not exists package_id uuid,
  add column if not exists item_id uuid,
  add column if not exists inventory_item_id uuid,
  add column if not exists quantity numeric(12,2) default 1,
  add column if not exists unit_price numeric(12,2) default 0;

-- Bookings and booking lines
alter table public.bookings
  add column if not exists booking_number text,
  add column if not exists event_name text,
  add column if not exists customer_id uuid,
  add column if not exists enquiry_id uuid,
  add column if not exists package_id uuid,
  add column if not exists event_type text,
  add column if not exists event_date date,
  add column if not exists venue text,
  add column if not exists status text default 'Planning',
  add column if not exists guests integer,
  add column if not exists total_amount numeric(12,2) default 0,
  add column if not exists paid_amount numeric(12,2) default 0,
  add column if not exists notes text;

alter table public.booking_items
  add column if not exists booking_id uuid,
  add column if not exists item_id uuid,
  add column if not exists inventory_item_id uuid,
  add column if not exists description text,
  add column if not exists quantity numeric(12,2) default 1,
  add column if not exists unit_price numeric(12,2) default 0;

-- Invoices and invoice lines
alter table public.invoices
  add column if not exists booking_id uuid,
  add column if not exists invoice_number text,
  add column if not exists status text default 'Draft',
  add column if not exists issue_date date,
  add column if not exists due_date date,
  add column if not exists subtotal numeric(12,2) default 0,
  add column if not exists tax_amount numeric(12,2) default 0,
  add column if not exists total_amount numeric(12,2) default 0,
  add column if not exists paid_amount numeric(12,2) default 0,
  add column if not exists notes text;

alter table public.invoice_items
  add column if not exists invoice_id uuid,
  add column if not exists description text,
  add column if not exists quantity numeric(12,2) default 1,
  add column if not exists unit_price numeric(12,2) default 0,
  add column if not exists total numeric(12,2) default 0;

-- Payments / expenses
alter table public.payments
  add column if not exists booking_id uuid,
  add column if not exists invoice_id uuid,
  add column if not exists amount numeric(12,2) default 0,
  add column if not exists payment_date date,
  add column if not exists payment_method text,
  add column if not exists type text default 'Customer Payment',
  add column if not exists status text default 'Received',
  add column if not exists reference text,
  add column if not exists notes text;

-- Vendors and tasks
alter table public.vendors
  add column if not exists name text,
  add column if not exists contact_person text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists category text,
  add column if not exists notes text;

alter table public.tasks
  add column if not exists booking_id uuid,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists status text default 'Open',
  add column if not exists priority text default 'Normal',
  add column if not exists due_date date,
  add column if not exists assigned_to text;

-- The user explicitly requested a prototype setup without businesses-table RLS.
-- Do not deploy this setting to a public production app without replacing it with owner policies.
alter table public.businesses disable row level security;

-- Ensure the app role can reach these tables through Supabase's REST API.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table
  public.businesses, public.business_members, public.customers, public.enquiries,
  public.inventory_items, public.packages, public.package_items, public.bookings,
  public.booking_items, public.invoices, public.invoice_items, public.payments,
  public.vendors, public.tasks, public.profiles to authenticated;

-- Businesses remains readable for sign-in routing. For every operational table,
-- replace older table policies with a business-owner policy based on business_id.
-- The app only writes rows under the business the authenticated user owns.
do $$
declare
  t text;
  p record;
  tables text[] := array[
    'customers','enquiries','inventory_items','packages','package_items',
    'bookings','booking_items','invoices','invoice_items','payments','vendors','tasks'
  ];
begin
  foreach t in array tables loop
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy if exists %I on public.%I', p.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (exists (select 1 from public.businesses b where b.id = %I.business_id and b.owner_id = auth.uid())) with check (exists (select 1 from public.businesses b where b.id = %I.business_id and b.owner_id = auth.uid()))',
      'utsavkosh_owner_access', t, t, t
    );
  end loop;
end $$;

commit;

notify pgrst, 'reload schema';
