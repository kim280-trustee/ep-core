import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoodsReceipts } from "../hooks/useGoodsReceipts";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";
import { purchaseOrderRepository } from "@/features/purchasing/repositories";
import { storeContext } from "@/core/store/store.context";

export default function GoodsReceiptsPage() {
  const navigate = useNavigate();
  const context = storeContext.getStore();

  const {
    receipts,
    loadReceipts,
    loading,
    error,
  } = useGoodsReceipts();

  const [supplierNames, setSupplierNames] =
    useState<Record<string, string>>({});

  const [warehouseNames, setWarehouseNames] =
    useState<Record<string, string>>({});

  const [purchaseOrderNumbers, setPurchaseOrderNumbers] =
    useState<Record<string, string>>({});

  useEffect(() => {
    if (!context?.tenantId) return;
    void loadReceipts(context.tenantId);
  }, [context?.tenantId, loadReceipts]);

  useEffect(() => {
    let cancelled = false;

    async function loadNames() {
      if (!receipts.length || !context?.tenantId) {
        setSupplierNames({});
        setWarehouseNames({});
        setPurchaseOrderNumbers({});
        return;
      }

      try {
        const suppliers =
          await supplierService.getSuppliers(context.tenantId);

        const warehouses =
          await warehouseService.getWarehouses();

        const orders = await Promise.all(
          receipts.map((receipt) =>
            purchaseOrderRepository.findById(
              context.tenantId,
              receipt.purchaseOrderId,
            ),
          ),
        );

        if (cancelled) return;

        const supplierMap: Record<string, string> = {};
        for (const supplier of suppliers) {
          supplierMap[supplier.id] = supplier.name;
        }

        const warehouseMap: Record<string, string> = {};
        for (const warehouse of warehouses) {
          warehouseMap[warehouse.id] = warehouse.name;
        }

        const orderMap: Record<string, string> = {};
        for (const order of orders) {
          if (order) {
            orderMap[order.id] = order.orderNumber;
          }
        }

        setSupplierNames(supplierMap);
        setWarehouseNames(warehouseMap);
        setPurchaseOrderNumbers(orderMap);
      } catch (err) {
        console.error(
          "Failed to load goods receipt names:",
          err,
        );
      }
    }

    void loadNames();

    return () => {
      cancelled = true;
    };
  }, [receipts, context?.tenantId]);

  return (
    <div>
      <h1>Goods Receipts</h1>

      <button
        onClick={() =>
          navigate("/purchase-receiving/create")
        }
      >
        Create Goods Receipt
      </button>

      {loading && <p>Loading goods receipts...</p>}

      {error && <p>{error}</p>}

      {!loading && receipts.length === 0 && (
        <p>No goods receipts found.</p>
      )}

      {receipts.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Receipt Number</th>
              <th>Purchase Order</th>
              <th>Supplier</th>
              <th>Warehouse</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {receipts.map((receipt) => (
              <tr
                key={receipt.id}
                onClick={() =>
                  navigate(
                    `/purchase-receiving/${receipt.id}`,
                  )
                }
                style={{ cursor: "pointer" }}
              >
                <td>{receipt.receiptNumber}</td>

                <td>
                  {purchaseOrderNumbers[
                    receipt.purchaseOrderId
                  ] ?? "Unknown Purchase Order"}
                </td>

                <td>
                  {supplierNames[receipt.supplierId] ??
                    "Unknown Supplier"}
                </td>

                <td>
                  {warehouseNames[receipt.warehouseId] ??
                    "Unknown Warehouse"}
                </td>

                <td>{receipt.receivedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
