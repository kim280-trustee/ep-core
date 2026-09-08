import { useNavigate } from "react-router-dom";
import type { PurchaseOrder } from "../types/purchase-order.types";
import { usePurchaseOrderStore } from "../store/purchase-order.store";
import { useTranslation } from "@/core/i18n/useTranslation";

interface PurchaseOrderActionsProps { order: PurchaseOrder; }
function ActionButton({ children, onClick, variant = "primary" }: { children: React.ReactNode; onClick: () => void; variant?: "primary" | "secondary" | "danger" }) {
  const classes = { primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500", secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400", danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50 focus:ring-red-400" };
  return <button type="button" onClick={onClick} className={`inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${classes[variant]}`}>{children}</button>;
}

export function PurchaseOrderActions({ order }: PurchaseOrderActionsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { submitOrder, approveOrder, cancelOrder } = usePurchaseOrderStore();
  return <div className="flex flex-wrap items-center gap-3">
    {order.status === "DRAFT" && <ActionButton onClick={() => submitOrder(order.id)}>{t("purchasing.submitOrder")}</ActionButton>}
    {order.status === "SUBMITTED" && <><ActionButton onClick={() => approveOrder(order.id)}>{t("purchasing.approveOrder")}</ActionButton><ActionButton variant="danger" onClick={() => cancelOrder(order.id)}>{t("purchasing.cancelled")}</ActionButton></>}
    {(order.status === "APPROVED" || order.status === "PARTIALLY_RECEIVED") && <ActionButton onClick={() => navigate(`/purchase-receiving/create?purchaseOrderId=${order.id}`)}>{t("receiving.createGoodsReceipt")}</ActionButton>}
    {(order.status === "RECEIVED" || order.status === "PARTIALLY_RECEIVED") && <ActionButton variant="secondary" onClick={() => navigate(`/purchasing/returns/create?purchaseOrderId=${order.id}`)}>{t("navigation.purchaseReturns")}</ActionButton>}
  </div>;
}
