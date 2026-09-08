-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Purchase Receiving V1
-- Repair historical warehouse references
-- ============================================================
--
-- Older goods receipts were created with an incorrect warehouse
-- reference. The purchase order is the authoritative source for
-- the receiving warehouse. This migration realigns the receipt,
-- its purchase-receipt inventory transactions, and any inventory
-- records created under the erroneous warehouse reference.
--
-- The migration is intentionally data-driven and only changes
-- warehouse references that belong to existing goods receipts.
-- ============================================================

begin;

create temporary table purchase_receiving_warehouse_repairs
on commit drop as
select distinct
    gr.tenant_id,
    gr.id as goods_receipt_id,
    gr.warehouse_id as old_warehouse_id,
    po.warehouse_id as new_warehouse_id
from public.goods_receipts gr
join public.purchase_orders po
  on po.id = gr.purchase_order_id
 and po.tenant_id = gr.tenant_id
where po.warehouse_id is not null
  and gr.warehouse_id <> po.warehouse_id;

-- 1. Repair the goods receipt itself.
update public.goods_receipts gr
set warehouse_id = repair.new_warehouse_id
from purchase_receiving_warehouse_repairs repair
where gr.tenant_id = repair.tenant_id
  and gr.id = repair.goods_receipt_id;

-- 2. Repair the immutable inventory transaction's warehouse reference.
update public.inventory_transactions it
set warehouse_id = repair.new_warehouse_id
from purchase_receiving_warehouse_repairs repair
where it.tenant_id = repair.tenant_id
  and it.reference_id = repair.goods_receipt_id
  and it.reference_type = 'PURCHASE_RECEIPT'
  and it.movement_type = 'PURCHASE_RECEIPT';

-- 3. Move inventory records that were created under the old receipt
--    warehouse to the authoritative purchase-order warehouse.
--
--    If the target product/warehouse record already exists, merge the
--    stock into it using a quantity-weighted average cost. Otherwise,
--    simply re-point the existing record to the correct warehouse.
do $$
declare
    repair record;
    source_record record;
    target_record record;
    merged_quantity numeric;
    merged_average_cost numeric;
begin
    for repair in
        select distinct
            tenant_id,
            old_warehouse_id,
            new_warehouse_id
        from purchase_receiving_warehouse_repairs
        where old_warehouse_id <> new_warehouse_id
    loop
        for source_record in
            select *
            from public.inventory
            where tenant_id = repair.tenant_id
              and warehouse_id = repair.old_warehouse_id
        loop
            select *
            into target_record
            from public.inventory
            where tenant_id = source_record.tenant_id
              and product_id = source_record.product_id
              and warehouse_id = repair.new_warehouse_id
            limit 1;

            if target_record.id is null then
                update public.inventory
                set warehouse_id = repair.new_warehouse_id,
                    updated_at = now()
                where id = source_record.id;
            else
                merged_quantity :=
                    coalesce(target_record.quantity_on_hand, 0)
                    + coalesce(source_record.quantity_on_hand, 0);

                if merged_quantity > 0 then
                    merged_average_cost :=
                        (
                            coalesce(target_record.quantity_on_hand, 0)
                            * coalesce(target_record.average_cost, 0)
                        + coalesce(source_record.quantity_on_hand, 0)
                            * coalesce(source_record.average_cost, 0)
                        ) / merged_quantity;
                else
                    merged_average_cost :=
                        coalesce(target_record.average_cost, 0);
                end if;

                update public.inventory
                set quantity_on_hand = merged_quantity,
                    quantity_reserved =
                        coalesce(target_record.quantity_reserved, 0)
                        + coalesce(source_record.quantity_reserved, 0),
                    average_cost = merged_average_cost,
                    last_movement_at = greatest(
                        target_record.last_movement_at,
                        source_record.last_movement_at
                    ),
                    minimum_stock_level = greatest(
                        coalesce(target_record.minimum_stock_level, 0),
                        coalesce(source_record.minimum_stock_level, 0)
                    ),
                    maximum_stock_level = case
                        when target_record.maximum_stock_level is null
                            then source_record.maximum_stock_level
                        when source_record.maximum_stock_level is null
                            then target_record.maximum_stock_level
                        else greatest(
                            target_record.maximum_stock_level,
                            source_record.maximum_stock_level
                        )
                    end,
                    updated_at = now()
                where id = target_record.id;

                delete from public.inventory
                where id = source_record.id;
            end if;
        end loop;
    end loop;
end $$;

commit;
