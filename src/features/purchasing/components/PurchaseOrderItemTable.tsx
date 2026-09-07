import {
  useEffect,
  useState,
} from "react";

import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";

import {
  productService,
} from "@/features/products/services/product.service";


interface PurchaseOrderItemTableProps {
  items: PurchaseOrderItem[];
  tenantId: string;
}


export function PurchaseOrderItemTable({
  items,
  tenantId,
}: PurchaseOrderItemTableProps) {
  const [
    productNames,
    setProductNames,
  ] = useState<Record<string, string>>({});


  useEffect(() => {
    let cancelled = false;

    async function loadProductNames() {
      if (!tenantId || items.length === 0) {
        setProductNames({});
        return;
      }

      const uniqueProductIds = [
        ...new Set(
          items.map((item) => item.productId),
        ),
      ];

      const results = await Promise.all(
        uniqueProductIds.map(
          async (productId) => {
            try {
              const product =
                await productService.getProductById(
                  tenantId,
                  productId,
                );

              return [
                productId,
                product
                  ? `${product.name} — SKU: ${product.sku}`
                  : "Unknown Product",
              ] as const;
            } catch {
              return [
                productId,
                "Unknown Product",
              ] as const;
            }
          },
        ),
      );

      if (cancelled) return;

      setProductNames(
        Object.fromEntries(results),
      );
    }

    void loadProductNames();

    return () => {
      cancelled = true;
    };
  }, [items, tenantId]);


  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
        <p className="font-medium text-slate-700">
          No products added yet
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Add at least one product before submitting this purchase order.
        </p>
      </div>
    );
  }


  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200">
            <th className="px-4 py-3 text-left font-semibold text-slate-600">
              Product
            </th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">
              Ordered
            </th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">
              Received
            </th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">
              Unit Cost
            </th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">
              Tax %
            </th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">
              Line Total
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-slate-100 last:border-b-0"
            >
              <td className="px-4 py-4">
                <p className="font-medium text-slate-900">
                  {productNames[item.productId] ??
                    "Loading product..."}
                </p>
              </td>

              <td className="px-4 py-4 text-right text-slate-700">
                {item.quantity}
              </td>

              <td className="px-4 py-4 text-right text-slate-700">
                {item.receivedQuantity}
              </td>

              <td className="px-4 py-4 text-right text-slate-700">
                {item.unitCost}
              </td>

              <td className="px-4 py-4 text-right text-slate-700">
                {item.taxRate}
              </td>

              <td className="px-4 py-4 text-right font-semibold text-slate-900">
                {item.lineTotal}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
