import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";

import {
  useProductSearch,
} from "@/features/products/hooks/useProductSearch";

import {
  storeContext,
} from "@/core/store/store.context";
import { useTranslation } from "@/core/i18n/useTranslation";

interface PurchaseOrderItemFormProps {
  purchaseOrderId: string;
  tenantId?: string;
  productId?: string;
  onAddItem: (
    item: PurchaseOrderItem,
  ) => void | Promise<void>;
  onCancel?: () => void;
}

export function PurchaseOrderItemForm({
  purchaseOrderId,
  tenantId = "",
  productId: initialProductId = "",
  onAddItem,
  onCancel,
}: PurchaseOrderItemFormProps) {
  const context = storeContext.getStore();
  const { t } = useTranslation();
  const effectiveTenantId = tenantId || context?.tenantId || "";
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useProductSearch(effectiveTenantId, productSearch);

  useEffect(() => {
    if (!selectedProductId) return;
    const selected = products.find((product) => product.id === selectedProductId);
    if (!selected) return;
    setSelectedProductName(selected.name);
  }, [products, selectedProductId]);

  function handleProductSearchChange(value: string) {
    setProductSearch(value);
    setSelectedProductId("");
    setSelectedProductName("");
    setError("");
  }

  function handleSelectProduct(product: typeof products[number]) {
    setSelectedProductId(product.id);
    setSelectedProductName(product.name);
    setProductSearch(product.name);
    setUnitCost(String(product.costPrice ?? 0));
    setTaxRate(String(product.tax?.taxRate ?? 0));
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedProductId) {
      setError(t("purchasing.productSelectionRequired"));
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError(t("sales.quantityGreaterThanZero"));
      return;
    }

    const parsedUnitCost = Number(unitCost);
    if (!Number.isFinite(parsedUnitCost) || parsedUnitCost < 0) {
      setError(t("purchasing.unitCostZeroOrGreater"));
      return;
    }

    const parsedTaxRate = Number(taxRate || 0);
    if (!Number.isFinite(parsedTaxRate) || parsedTaxRate < 0) {
      setError(t("purchasing.taxRateZeroOrGreater"));
      return;
    }

    const lineSubtotal = parsedQuantity * parsedUnitCost;
    const taxAmount = lineSubtotal * (parsedTaxRate / 100);
    const lineTotal = lineSubtotal + taxAmount;
    const now = new Date().toISOString();

    const item: PurchaseOrderItem = {
      id: crypto.randomUUID(),
      tenantId,
      purchaseOrderId,
      productId: selectedProductId,
      quantity: parsedQuantity,
      receivedQuantity: 0,
      unitCost: parsedUnitCost,
      taxRate: parsedTaxRate,
      taxAmount,
      lineTotal,
      notes: notes.trim() || null,
      createdAt: now,
      updatedAt: now,
    };

    setAdding(true);
    Promise.resolve(onAddItem(item))
      .then(() => {
        setProductSearch("");
        setSelectedProductId("");
        setSelectedProductName("");
        setQuantity("");
        setUnitCost("");
        setTaxRate("0");
        setNotes("");
      })
      .catch((caughtError) => {
        console.error("Failed to add purchase order item:", caughtError);
        setError(caughtError instanceof Error ? caughtError.message : t("purchasing.failedToAddPurchaseOrderItem"));
      })
      .finally(() => setAdding(false));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="purchase-product-search" className="block text-sm font-semibold text-slate-700">
          {t("products.productName")}
        </label>
        <p className="mt-1 text-xs text-slate-500">{t("purchasing.productSearchDescription")}</p>
        <input
          id="purchase-product-search"
          type="text"
          value={productSearch}
          onChange={(event) => handleProductSearchChange(event.target.value)}
          placeholder={t("purchasing.productSearchPlaceholder")}
          autoComplete="off"
          className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {productsLoading && <p className="mt-2 text-sm text-slate-500">{t("purchasing.searchingProducts")}</p>}
        {productsError && <p className="mt-2 text-sm text-red-600">{t("purchasing.unableToSearchProducts")}</p>}

        {!selectedProductId && productSearch.trim().length > 0 && !productsLoading && products.length === 0 && !productsError && (
          <p className="mt-2 text-sm text-slate-500">{t("purchasing.noMatchingProducts")}</p>
        )}

        {!selectedProductId && products.length > 0 && (
          <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-md">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSelectProduct(product)}
                className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-blue-50"
              >
                <div className="font-medium text-slate-900">{product.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {t("products.sku")}: {product.sku} • {t("products.costPrice")}: {product.costPrice}
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedProductId && (
          <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t("purchasing.selectedProduct")}</p>
            <p className="mt-1 font-semibold text-emerald-900">{selectedProductName}</p>
          </div>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="purchase-quantity" className="block text-sm font-semibold text-slate-700">{t("common.quantity")}</label>
          <input id="purchase-quantity" type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder={t("purchasing.quantityPlaceholder")} className="mt-2 min-h-12 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2.5 text-base font-medium text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div>
          <label htmlFor="purchase-unit-cost" className="block text-sm font-semibold text-slate-700">{t("purchasing.unitCost")}</label>
          <input id="purchase-unit-cost" type="number" min="0" step="0.01" value={unitCost} onChange={(event) => setUnitCost(event.target.value)} placeholder={t("purchasing.unitCostPlaceholder")} className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div>
          <label htmlFor="purchase-tax-rate" className="block text-sm font-semibold text-slate-700">{t("purchasing.taxRate")}</label>
          <input id="purchase-tax-rate" type="number" min="0" step="0.01" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} placeholder="0" className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div>
          <label htmlFor="purchase-notes" className="block text-sm font-semibold text-slate-700">{t("expenses.notes")}</label>
          <textarea id="purchase-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} placeholder={t("purchasing.notesPlaceholderOptional")} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"><p className="text-sm font-medium text-red-700">{error}</p></div>}

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
        <button type="submit" disabled={adding || !selectedProductId} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          {adding ? t("purchasing.addingProduct") : t("purchasing.addProductToOrder")}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>}
      </div>
    </form>
  );
}
