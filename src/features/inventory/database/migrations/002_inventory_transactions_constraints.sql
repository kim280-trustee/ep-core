-- ============================================================
-- E&P Smart POS
-- Inventory Transactions
-- V1 Production Constraint Migration
-- ============================================================

alter table public.inventory_transactions
    drop constraint if exists inventory_transactions_quantity_check;

alter table public.inventory_transactions
    add constraint inventory_transactions_quantity_check
    check (quantity > 0);

alter table public.inventory_transactions
    drop constraint if exists inventory_transactions_before_check;

alter table public.inventory_transactions
    drop constraint if exists inventory_transactions_after_check;
