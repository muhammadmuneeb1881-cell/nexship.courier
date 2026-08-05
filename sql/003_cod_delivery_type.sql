-- NexShip — COD vs Normal delivery migration
-- Run this in the Supabase SQL editor (or via `psql`) AFTER 002_platform_features.sql.
-- Safe to re-run: every statement uses IF NOT EXISTS guards.
--
-- Adds a proper split between:
--   delivery_charges -> what NexShip charges for the delivery service itself
--                       (computed from weight/quantity/package type, same as before)
--   parcel_value      -> the price of the parcel/item that the merchant wants
--                        collected from the receiver (only used when is_cod = true)
--   is_cod             -> true  = Cash on Delivery booking (amount collected from receiver)
--                          false = Normal/Prepaid booking (nothing collected from receiver)
--
-- `price` is kept as-is (delivery_charges + parcel_value) so every existing
-- query/UI that reads `price` as "total amount" keeps working unchanged.

alter table orders add column if not exists is_cod boolean not null default true;
alter table orders add column if not exists parcel_value numeric not null default 0;
alter table orders add column if not exists delivery_charges numeric;

-- Backfill existing rows: treat historical orders as COD bookings where the
-- whole `price` was the delivery charge (parcel_value unknown -> 0), which
-- matches how the site behaved before this migration.
update orders
set delivery_charges = price
where delivery_charges is null;

alter table orders alter column delivery_charges set not null;

create index if not exists idx_orders_is_cod on orders (is_cod);
