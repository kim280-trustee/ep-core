import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PurchaseOrder } from "../types/purchase-order.types";
import { PurchaseOrderStatusBadge } from "./PurchaseOrderStatusBadge";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { useTranslation } from "../../../core/i18n/useTranslation";

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
}

export function PurchaseOrderTable({ orders }: PurchaseOrderTableProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [supplierNames, setSupplierNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function loadSupplierNames() {
      if (orders.length === 0) {
        setSupplierNames({});
        return;
      }
      try {
        const suppliers = await supplierService.getSuppliers(orders[0].tenantId);
        if (cancelled) return;
        const names: Record<string, string> = {};
        for (const supplier of suppliers) names[supplier.id] = supplier.name;
        setSupplierNames(names);
      } catch (error) {
        console.error("Failed to load purchase order suppliers:", error);
      }
    }
    void loadSupplierNames();
    return () => { cancelled = true; };
  }, [orders]);

  return (
    <div>
      <h2>{t("purchasing.purchaseOrders")}</h2>
      {orders.length === 0 ? (
        <p>{t("purchasing.noPurchaseOrders")}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{t("purchasing.orderNumber")}</th>
              <th>{t("purchasing.supplier")}</th>
              <th>{t("common.status")}</th>
              <th>{t("common.total")}</th>
              <th>{t("common.date")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} onClick={() => navigate(`/purchasing/${order.id}`)}>
                <td>{order.orderNumber}</td>
                <td>{supplierNames[order.supplierId] ?? t("common.unknown")}</td>
                <td><PurchaseOrderStatusBadge status={order.status} /></td>
                <td>{order.totalAmount}</td>
                <td>{order.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
