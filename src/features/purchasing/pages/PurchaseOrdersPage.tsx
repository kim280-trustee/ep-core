import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { PurchaseOrderTable } from "../components/PurchaseOrderTable";
import { storeContext } from "@/core/store/store.context";
import { useTranslation } from "../../../core/i18n/useTranslation";

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { orders, loadOrders } = usePurchaseOrders();
  const context = storeContext.getStore();

  useEffect(() => {
    if (!context?.tenantId) return;
    void loadOrders(context.tenantId);
  }, [context?.tenantId, loadOrders]);

  return (
    <div>
      <h1>{t("purchasing.purchaseOrders")}</h1>
      <button onClick={() => navigate("/purchasing/create")}>
        {t("purchasing.createPurchaseOrder")}
      </button>
      <PurchaseOrderTable orders={orders} />
    </div>
  );
}
