import type {
  PurchaseOrderStatus,
} from "../types/purchase-order-status.types";
import { useTranslation } from "../../../core/i18n/useTranslation";

interface PurchaseOrderStatusBadgeProps {
  status: PurchaseOrderStatus;
}

export function PurchaseOrderStatusBadge({
  status,
}: PurchaseOrderStatusBadgeProps) {
  const { t } = useTranslation();

  const styles = {
    DRAFT: "bg-gray-100 text-gray-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    APPROVED: "bg-green-100 text-green-700",
    PARTIALLY_RECEIVED: "bg-yellow-100 text-yellow-700",
    RECEIVED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const labels: Record<PurchaseOrderStatus, string> = {
    DRAFT: t("purchasing.draft"),
    SUBMITTED: t("purchasing.submitted"),
    APPROVED: t("purchasing.approved"),
    PARTIALLY_RECEIVED: t("purchasing.partiallyReceived"),
    RECEIVED: t("purchasing.received"),
    CANCELLED: t("purchasing.cancelled"),
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
