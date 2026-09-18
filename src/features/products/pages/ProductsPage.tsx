/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Products Page
 * ============================================================
 */

import { useEffect, useMemo } from "react";
import { ProductToolbar } from "../components/ProductToolbar";
import { ProductTable } from "../components/ProductTable";
import { ProductForm } from "../components/ProductForm";
import { useProducts } from "../hooks/useProducts";
import { useCreateProduct } from "../hooks/useProductMutations";
import { useProductStore } from "../store/products.store";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import type { CreateProductInput } from "../types/product.types";
import type { ProductFormValues } from "../schemas/product.schema";
import { Link } from "react-router-dom";
import { storeContext } from "@/core/store/store.context";
import { useSettingsStore } from "@/features/settings/store/settings.store";

export function ProductsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const tenantId = user?.tenantId ?? "";
  const storeId = storeContext.getStore()?.storeId ?? null;
  const settings = useSettingsStore((state) => state.settings);

  useEffect(() => {
    if (tenantId) useSettingsStore.getState().loadSettings(tenantId);
  }, [tenantId]);

  const { filters, updateFilters } = useProductStore();
  const { data, isLoading } = useProducts({ tenantId, filters });
  const createProduct = useCreateProduct(tenantId);

  const products = useMemo(() => data?.data ?? [], [data]);

  async function handleCreate(values: ProductFormValues) {
    const input: CreateProductInput = {
      tenantId,
      storeId: storeId ?? undefined,
      name: values.name,
      sku: values.sku,
      currency: settings?.currency ?? values.currency ?? "THB",
      productType: values.productType,
      status: values.status,
      costPrice: values.costPrice,
      sellingPrice: values.sellingPrice,
      trackInventory: values.trackInventory,
      barcode: values.barcode ?? undefined,
      description: values.description ?? undefined,
      categoryId: values.categoryId ?? undefined,
      brandId: values.brandId ?? undefined,
      unitId: values.unitId ?? undefined,
      taxId: values.taxId ?? undefined,
      imageUrl: values.imageUrl ?? undefined,
    };

    await createProduct.mutateAsync(input);
  }

  if (!tenantId) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold">Products</h1><p className="text-sm text-gray-500">Add products one at a time, or import hundreds at once.</p></div>
        <Link to="/products/import" className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700">Import Products</Link>
      </div>
      <ProductToolbar filters={filters} updateFilters={updateFilters} />
      <ProductForm onSubmit={handleCreate} loading={createProduct.isPending} />
      <ProductTable products={products} loading={isLoading} />
    </div>
  );
}
