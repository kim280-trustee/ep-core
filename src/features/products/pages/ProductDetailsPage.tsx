import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProduct } from "../hooks/useProduct";
import { ProductStatusBadge } from "../components/ProductStatusBadge";
import { productService } from "../services/product.service";
import { useAuth } from "@/core/auth";
import { storeContext } from "@/core/store/store.context";
import { useCategories } from "@/features/categories";
import { useBrands } from "@/features/brands";
import { useUnits } from "@/features/units";
import { useTranslation } from "@/core/i18n/useTranslation";

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const tenantId = user?.tenantId ?? "";
  const productId = id ?? "";
  const store = storeContext.getStore();
  const storeId = store?.storeId ?? "";
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data: product, isLoading, error } = useProduct(tenantId, productId);
  const { categories, loadCategories } = useCategories();
  const { brands, loadBrands } = useBrands();
  const { units } = useUnits();

  useEffect(() => {
    if (!tenantId || !storeId) return;
    void loadCategories(tenantId, storeId);
    void loadBrands(tenantId, storeId);
  }, [tenantId, storeId, loadCategories, loadBrands]);

  async function handleDelete() {
    if (!product) return;
    if (!tenantId) {
      setDeleteError(t("products.deleteTenantUnavailable"));
      return;
    }
    if (!window.confirm(`${t("common.delete")} "${product.name}"?\n\n${t("products.deleteConfirmation")}`)) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await productService.deleteProduct(tenantId, product.id);
      navigate("/products", { replace: true });
    } catch (err) {
      console.error("ProductDetailsPage.handleDelete:", err);
      setDeleteError(err instanceof Error ? err.message : t("products.unableToDeleteProduct"));
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading) return <div className="rounded-xl border bg-white p-6"><h1 className="text-xl font-semibold text-gray-900">{t("products.loadingProduct")}</h1><p className="mt-2 text-sm text-gray-500">{t("products.loadingProductDescription")}</p></div>;
  if (error) return <div className="rounded-xl border bg-white p-6"><h1 className="text-xl font-semibold text-gray-900">{t("products.unableToLoadProduct")}</h1><p className="mt-2 text-sm text-red-600">{error instanceof Error ? error.message : t("products.unexpectedError")}</p></div>;
  if (!product) return <div className="rounded-xl border bg-white p-6"><h1 className="text-xl font-semibold text-gray-900">{t("products.productNotFound")}</h1><p className="mt-2 text-sm text-gray-500">{t("products.productNotFoundDescription")}</p></div>;

  const currency = product.pricing?.currency ?? "THB";
  const costPrice = Number(product.costPrice ?? 0);
  const sellingPrice = Number(product.sellingPrice ?? 0);
  const stockQuantity = Number(product.inventory?.stockQuantity ?? 0);
  const categoryName = categories.find((category) => category.id === product.categoryId)?.name ?? t("common.unknown");
  const brandName = brands.find((brand) => brand.id === product.brandId)?.name ?? t("common.unknown");
  const unit = units.find((item) => item.id === product.unitId);
  const unitName = unit ? `${unit.name} (${unit.symbol})` : t("common.unknown");
  const productTypeLabel = product.productType === "PRODUCT" ? t("products.productTypeProduct") : product.productType === "SERVICE" ? t("products.productTypeService") : product.productType;
  const statusLabel = product.status === "ACTIVE" ? t("products.active") : t("products.inactive");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-6 md:flex-row md:items-start md:justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">{product.name}</h1><p className="mt-1 text-sm text-gray-500">{t("products.sku")}: {product.sku}</p></div>
        <div className="flex flex-wrap items-center gap-3"><ProductStatusBadge status={product.status} /><Link to={`/products/${product.id}/edit`} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">{t("common.edit")}</Link><button type="button" onClick={handleDelete} disabled={deleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">{deleting ? t("products.deleting") : t("common.delete")}</button></div>
      </div>

      {deleteError && <div className="rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-sm font-medium text-red-700">{deleteError}</p></div>}

      <div className="rounded-xl border bg-white p-6"><h2 className="text-lg font-semibold text-gray-900">{t("products.productInformation")}</h2><div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div><p className="text-sm text-gray-500">{t("products.productName")}</p><p className="mt-1 font-medium">{product.name}</p></div>
        <div><p className="text-sm text-gray-500">{t("products.sku")}</p><p className="mt-1 font-medium">{product.sku}</p></div>
        <div><p className="text-sm text-gray-500">{t("products.barcode")}</p><p className="mt-1 font-medium">{product.barcode ?? t("common.noData")}</p></div>
        <div><p className="text-sm text-gray-500">{t("products.productType")}</p><p className="mt-1 font-medium">{productTypeLabel}</p></div>
        <div><p className="text-sm text-gray-500">{t("common.status")}</p><p className="mt-1 font-medium">{statusLabel}</p></div>
        <div><p className="text-sm text-gray-500">{t("products.currency")}</p><p className="mt-1 font-medium">{currency}</p></div>
      </div></div>

      <div className="rounded-xl border bg-white p-6"><h2 className="text-lg font-semibold text-gray-900">{t("products.pricing")}</h2><div className="mt-6 grid gap-6 md:grid-cols-2"><div><p className="text-sm text-gray-500">{t("products.costPrice")}</p><p className="mt-1 text-xl font-semibold">{currency} {costPrice.toFixed(2)}</p></div><div><p className="text-sm text-gray-500">{t("products.sellingPrice")}</p><p className="mt-1 text-xl font-semibold">{currency} {sellingPrice.toFixed(2)}</p></div></div></div>

      <div className="rounded-xl border bg-white p-6"><h2 className="text-lg font-semibold text-gray-900">{t("inventory.title")}</h2><div className="mt-6 grid gap-6 md:grid-cols-2"><div><p className="text-sm text-gray-500">{t("products.trackInventory")}</p><p className="mt-1 font-medium">{product.trackInventory ? t("common.yes") : t("common.no")}</p></div><div><p className="text-sm text-gray-500">{t("inventory.currentStock")}</p><p className="mt-1 font-medium">{stockQuantity}</p></div></div></div>

      <div className="rounded-xl border bg-white p-6"><h2 className="text-lg font-semibold text-gray-900">{t("products.additionalInformation")}</h2><div className="mt-6 space-y-4"><div><p className="text-sm text-gray-500">{t("common.description")}</p><p className="mt-1">{product.description || t("common.noData")}</p></div><div className="grid gap-6 md:grid-cols-2"><div><p className="text-sm text-gray-500">{t("products.category")}</p><p className="mt-1">{categoryName}</p></div><div><p className="text-sm text-gray-500">{t("products.brand")}</p><p className="mt-1">{brandName}</p></div><div><p className="text-sm text-gray-500">{t("products.unit")}</p><p className="mt-1">{unitName}</p></div><div><p className="text-sm text-gray-500">{t("common.tax")}</p><p className="mt-1">{product.taxId ?? t("common.noData")}</p></div></div></div></div>
    </div>
  );
}
