import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PurchaseOrder } from "../types/purchase-order.types";
import { PurchaseOrderStatusBadge } from "./PurchaseOrderStatusBadge";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { useTranslation } from "../../../core/i18n/useTranslation";

interface PurchaseOrderTableProps { orders: PurchaseOrder[]; }

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "THB", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export function PurchaseOrderTable({ orders }: PurchaseOrderTableProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [supplierNames, setSupplierNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function loadSupplierNames() {
      if (orders.length === 0) { setSupplierNames({}); return; }
      try {
        const suppliers = await supplierService.getSuppliers(orders[0].tenantId);
        if (cancelled) return;
        const names: Record<string, string> = {};
        for (const supplier of suppliers) names[supplier.id] = supplier.name;
        setSupplierNames(names);
      } catch (error) { console.error("Failed to load purchase order suppliers:", error); }
    }
    void loadSupplierNames();
    return () => { cancelled = true; };
  }, [orders]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-950">{t("purchasing.purchaseOrders")}</h2>
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-900">{t("purchasing.noPurchaseOrders")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("purchasing.orderNumber")}</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("purchasing.supplier")}</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("common.status")}</th>
                  <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">{t("common.total")}</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("common.date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} onClick={() => navigate(`/purchasing/${order.id}`)} className="cursor-pointer transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950">{order.orderNumber}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">{supplierNames[order.supplierId] ?? t("common.unknown")}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm"><PurchaseOrderStatusBadge status={order.status} /></td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-950">{currencyFormatter.format(order.totalAmount)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
