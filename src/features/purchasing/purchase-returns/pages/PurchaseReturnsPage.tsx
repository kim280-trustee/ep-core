import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { purchaseReturnService } from "../services/purchase-return.service";
import type { PurchaseReturn } from "../types";
import { storeContext } from "@/core/store/store.context";
import { purchaseOrderRepository } from "../../repositories";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";

export default function PurchaseReturnsPage() {
  const navigate = useNavigate();
  const context = storeContext.getStore();

  const [returns, setReturns] = useState<PurchaseReturn[]>([]);
  const [orderNumbers, setOrderNumbers] = useState<Record<string, string>>({});
  const [supplierNames, setSupplierNames] = useState<Record<string, string>>({});
  const [warehouseNames, setWarehouseNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!context?.tenantId) {
        setLoading(false);
        return;
      }

      try {
        const data = await purchaseReturnService.getReturns(context.tenantId);

        if (cancelled) return;

        setReturns(data);

        const orders = await Promise.all(
          data.map((item) =>
            purchaseOrderRepository.findById(
              context.tenantId,
              item.purchaseOrderId,
            ),
          ),
        );

        const suppliers = await Promise.all(
          data.map((item) =>
            supplierService.getSupplierById(
              context.tenantId,
              item.supplierId,
            ),
          ),
        );

        const warehouses = await Promise.all(
          data.map((item) =>
            warehouseService.getWarehouseById(item.warehouseId),
          ),
        );

        if (cancelled) return;

        const orderMap: Record<string, string> = {};
        const supplierMap: Record<string, string> = {};
        const warehouseMap: Record<string, string> = {};

        data.forEach((item, index) => {
          orderMap[item.purchaseOrderId] =
            orders[index]?.orderNumber ?? "Unknown Purchase Order";

          supplierMap[item.supplierId] =
            suppliers[index]?.name ?? "Unknown Supplier";

          warehouseMap[item.warehouseId] =
            warehouses[index]?.name ?? "Unknown Warehouse";
        });

        setOrderNumbers(orderMap);
        setSupplierNames(supplierMap);
        setWarehouseNames(warehouseMap);
      } catch (error) {
        console.error("Failed to load purchase returns:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [context?.tenantId]);

  return (
    <div>
      <h1>Purchase Returns</h1>

      <button
        type="button"
        onClick={() => navigate("/purchasing/returns/create")}
      >
        Create Purchase Return
      </button>

      {loading && <p>Loading purchase returns...</p>}

      {!loading && returns.length === 0 && (
        <p>No purchase returns found.</p>
      )}

      {!loading && returns.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Return Number</th>
              <th>Purchase Order</th>
              <th>Supplier</th>
              <th>Warehouse</th>
              <th>Status</th>
              <th>Total</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {returns.map((item) => (
              <tr
                key={item.id}
                onClick={() =>
                  navigate(`/purchasing/returns/${item.id}`)
                }
                style={{ cursor: "pointer" }}
              >
                <td>{item.returnNumber}</td>
                <td>
                  {orderNumbers[item.purchaseOrderId] ??
                    "Unknown Purchase Order"}
                </td>
                <td>
                  {supplierNames[item.supplierId] ??
                    "Unknown Supplier"}
                </td>
                <td>
                  {warehouseNames[item.warehouseId] ??
                    "Unknown Warehouse"}
                </td>
                <td>{item.status}</td>
                <td>
                  {item.totalAmount} {item.items.length > 0 ? "" : ""}
                </td>
                <td>{item.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
