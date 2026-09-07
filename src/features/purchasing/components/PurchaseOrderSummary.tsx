import type {
  PurchaseOrder,
} from "../types/purchase-order.types";


interface PurchaseOrderSummaryProps {
  order: PurchaseOrder;
}


export function PurchaseOrderSummary({
  order,
}: PurchaseOrderSummaryProps) {
  const currency = order.currency || "THB";

  const formatMoney = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);


  return (
    <div>
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Purchase Summary
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Financial summary for this purchase order.
        </p>
      </div>

      <div className="ml-auto max-w-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm">
          <span className="text-slate-500">
            Subtotal
          </span>
          <span className="font-medium text-slate-900">
            {formatMoney(order.subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm">
          <span className="text-slate-500">
            Tax Amount
          </span>
          <span className="font-medium text-slate-900">
            {formatMoney(order.taxAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-4">
          <span className="font-semibold text-slate-900">
            Total Amount
          </span>
          <span className="text-xl font-bold text-slate-900">
            {formatMoney(order.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
