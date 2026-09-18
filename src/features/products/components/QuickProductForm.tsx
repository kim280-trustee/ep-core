import { useEffect, useState } from "react";
import { useCreateProduct } from "../hooks/useProductMutations";
import { useSettingsStore } from "@/features/settings/store/settings.store";
import { storeContext } from "@/core/store/store.context";
import type { Product } from "../types/product.types";

interface QuickProductFormProps {
  tenantId: string;
  onCreated?: (product: Product) => void;
}

const makeSku = (name: string) =>
  `QK-${name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30) || "PRODUCT"}-${Date.now().toString().slice(-6)}`;

export function QuickProductForm({ tenantId, onCreated }: QuickProductFormProps) {
  const [name, setName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [error, setError] = useState("");
  const createProduct = useCreateProduct(tenantId);

  useEffect(() => {
    if (tenantId) void useSettingsStore.getState().loadSettings(tenantId);
  }, [tenantId]);

  const currency = useSettingsStore((state) => state.settings?.currency ?? "THB");

  async function submit() {
    const cleanName = name.trim();
    const price = Number(sellingPrice);
    const cost = costPrice.trim() ? Number(costPrice) : 0;
    const storeId = storeContext.getStore()?.storeId ?? undefined;

    if (cleanName.length < 2) return setError("Enter a product name.");
    if (!Number.isFinite(price) || price < 0) return setError("Enter a valid selling price.");

    try {
      const product = await createProduct.mutateAsync({
        tenantId,
        storeId,
        name: cleanName,
        sku: makeSku(cleanName),
        costPrice: Number.isFinite(cost) && cost >= 0 ? cost : 0,
        sellingPrice: price,
        currency,
        trackInventory: true,
      });
      setName("");
      setSellingPrice("");
      setCostPrice("");
      setError("");
      onCreated?.(product);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create product.");
    }
  }

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Quick Add Product</h2>
        <p className="text-sm text-gray-500">Add a product with just the information you have. You can complete the full profile later.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Product name" className="rounded-lg border p-2" />
        <input value={sellingPrice} onChange={(event) => setSellingPrice(event.target.value)} type="number" min="0" step="0.01" placeholder={`Selling price (${currency})`} className="rounded-lg border p-2" />
        <input value={costPrice} onChange={(event) => setCostPrice(event.target.value)} type="number" min="0" step="0.01" placeholder={`Cost price (${currency}) optional`} className="rounded-lg border p-2" />
        <button type="button" onClick={() => void submit()} disabled={createProduct.isPending} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
          {createProduct.isPending ? "Adding..." : "Add Product"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
