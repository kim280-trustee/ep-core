import { useNavigate, useParams } from "react-router-dom";
import { useProduct } from "../hooks/useProduct";
import { useUpdateProduct } from "../hooks/useProductMutations";
import { ProductForm } from "../components/ProductForm";
import type { ProductFormValues } from "../schemas/product.schema";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";

export function ProductEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const tenantId = user?.tenantId ?? "";
  const productId = id ?? "";
  const { data: product, isLoading, error } = useProduct(tenantId, productId);
  const updateProduct = useUpdateProduct(tenantId);

  const handleSubmit = async (values: ProductFormValues) => {
    await updateProduct.mutateAsync({
      id: productId,
      input: {
        name: values.name, sku: values.sku, barcode: values.barcode ?? undefined,
        description: values.description ?? null, categoryId: values.categoryId ?? undefined,
        brandId: values.brandId ?? undefined, unitId: values.unitId ?? undefined,
        taxId: values.taxId ?? undefined, productType: values.productType, status: values.status,
        costPrice: values.costPrice, sellingPrice: values.sellingPrice, currency: values.currency,
        trackInventory: values.trackInventory, imageUrl: values.imageUrl ?? undefined,
      },
    });
    navigate(`/products/${productId}`);
  };

  if (isLoading) return <div className="rounded-xl border bg-white p-6"><h1 className="text-xl font-semibold text-gray-900">{t("products.loadingProduct")}</h1><p className="mt-2 text-sm text-gray-500">{t("products.loadingProductDescription")}</p></div>;
  if (error) return <div className="rounded-xl border bg-white p-6"><h1 className="text-xl font-semibold text-gray-900">{t("products.unableToLoadProduct")}</h1><p className="mt-2 text-sm text-red-600">{error instanceof Error ? error.message : t("products.unexpectedError")}</p></div>;
  if (!product) return <div className="rounded-xl border bg-white p-6"><h1 className="text-xl font-semibold text-gray-900">{t("products.productNotFound")}</h1><p className="mt-2 text-sm text-gray-500">{t("products.productNotFoundDescription")}</p></div>;

  const defaultValues = {
    name: product.name, sku: product.sku, barcode: product.barcode ?? undefined,
    description: product.description ?? undefined, categoryId: product.categoryId ?? undefined,
    brandId: product.brandId ?? undefined, unitId: product.unitId ?? undefined,
    taxId: product.taxId ?? undefined, productType: product.productType, status: product.status,
    costPrice: Number(product.costPrice ?? 0), sellingPrice: Number(product.sellingPrice ?? 0),
    currency: product.pricing?.currency ?? "THB", trackInventory: product.trackInventory,
    imageUrl: product.imageUrl ?? undefined,
  };

  return <div className="space-y-6"><div className="rounded-xl border bg-white p-6"><h1 className="text-2xl font-bold text-gray-900">{t("products.editProduct")}</h1><p className="mt-1 text-sm text-gray-500">{product.name}</p></div><ProductForm defaultValues={defaultValues} onSubmit={handleSubmit} loading={updateProduct.isPending} /></div>;
}
