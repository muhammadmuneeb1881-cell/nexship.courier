-- NexShip platform features migration
-- Run this in the Supabase SQL editor (or via `psql`) AFTER your existing
-- orders / pricing / inquiries tables already exist.
-- Safe to re-run: every statement uses IF NOT EXISTS / ON CONFLICT guards.

-- ============================================================
-- 1. MERCHANTS
-- ============================================================
create table if not exists merchants (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  owner_name text not null,
  phone text not null,
  email text not null unique,
  ntn text,
  strn text,
  pickup_address text,
  password_hash text not null,
  status text not null default 'Active' check (status in ('Active', 'Suspended')),
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create index if not exists idx_merchants_email on merchants (lower(email));

-- Link orders to the merchant who created them (nullable — existing/public
-- website orders have no merchant and remain valid).
alter table orders add column if not exists merchant_id uuid references merchants(id) on delete set null;
alter table orders add column if not exists cod_status text not null default 'Pending'
  check (cod_status in ('Pending', 'Collected', 'Remitted'));
alter table orders add column if not exists cod_collected_at timestamptz;
alter table orders add column if not exists cod_remitted_at timestamptz;

create index if not exists idx_orders_merchant on orders (merchant_id);

-- ============================================================
-- 2. RETURNS
-- ============================================================
create table if not exists returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  merchant_id uuid references merchants(id) on delete set null,
  reason text not null,
  status text not null default 'Requested'
    check (status in ('Requested', 'Approved', 'In Transit', 'Received', 'Refunded', 'Rejected')),
  redelivery_requested boolean not null default false,
  redelivery_address text,
  timeline jsonb not null default '[]'::jsonb, -- [{status, note, at}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_returns_order on returns (order_id);
create index if not exists idx_returns_merchant on returns (merchant_id);

-- ============================================================
-- 3. NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_type text not null check (recipient_type in ('admin', 'merchant')),
  merchant_id uuid references merchants(id) on delete cascade, -- null when recipient_type = 'admin'
  category text not null check (category in ('order', 'pickup', 'cod', 'system')),
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_recipient on notifications (recipient_type, merchant_id, read);

-- ============================================================
-- 4. SUPPORT TICKETS (replaces the old AI chat widget)
-- ============================================================
create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_support_tickets_status on support_tickets (status);

-- ============================================================
-- 5. AUDIT LOGS
-- ============================================================
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null check (actor_type in ('admin', 'merchant')),
  actor_label text not null, -- e.g. "admin" or merchant company name
  action text not null,      -- e.g. "merchant.create", "order.status_change"
  target text,                -- free-form identifier of what was acted on
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created on audit_logs (created_at desc);
