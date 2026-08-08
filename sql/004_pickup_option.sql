-- NexShip — Pickup option migration
-- Run this in the Supabase SQL editor (or via `psql`) AFTER 003_cod_delivery_type.sql.
-- Safe to re-run: every statement uses IF NOT EXISTS guards.
--
-- Adds support for an optional pickup service on every booking (COD or
-- Normal/Prepaid):
--   requires_pickup -> true  = customer wants NexShip to collect the parcel
--                              from pickup_address (flat Rs 150 fee, all
--                              over Karachi)
--                      false = customer will drop the parcel off themselves
--                              (no pickup fee)
--   pickup_charges   -> the flat pickup fee actually charged on this order
--                        (150 when requires_pickup = true, else 0). Already
--                        included inside delivery_charges, kept as its own
--                        column so it can be reported on separately.
--
-- `delivery_charges` and `price` keep their existing meaning — pickup_charges
-- is simply itemized out of delivery_charges, not added on top of it.

alter table orders add column if not exists requires_pickup boolean not null default true;
alter table orders add column if not exists pickup_charges numeric not null default 0;

-- Backfill existing rows: historical orders were booked before this option
-- existed, so pickup was implicitly included and no separate fee was ever
-- charged for it. Mark them as pickup-requested with a 0 fee so nothing
-- retroactively changes for past bookings.
update orders
set requires_pickup = true,
    pickup_charges = 0
where pickup_charges is null;

create index if not exists idx_orders_requires_pickup on orders (requires_pickup);
