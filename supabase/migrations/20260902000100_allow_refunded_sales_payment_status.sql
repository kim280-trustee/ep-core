-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Sales V1
-- Allow REFUNDED payment status on sales orders
-- ============================================================

alter table public.sales_orders
drop constraint if exists sales_orders_payment_status_check;

alter table public.sales_orders
add constraint sales_orders_payment_status_check
check (
    payment_status in (
        'UNPAID',
        'PARTIALLY_PAID',
        'PAID',
        'REFUNDED'
    )
);
