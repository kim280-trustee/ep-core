import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, type ProductFormInput, type ProductFormValues } from "../schemas/product.schema";
import { ProductStatus, ProductType } from "../types/product.types";
import { useCategories } from "@/features/categories";
import { useBrands } from "@/features/brands";
import { useUnits } from "@/features/units";
import { storeContext } from "@/core/store/store.context";
import { useTranslation } from "@/core/i18n/useTranslation";

interface ProductFormProps {
  defaultValues?: Partial<ProductFormInput>;
  onSubmit?: (values: ProductFormValues) => void;
  loading?: boolean;
}

export function ProductForm({ defaultValues, onSubmit = () => {}, loading = false }: ProductFormProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormInput, undefined, ProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "", sku: "", currency: "THB", productType: ProductType.PRODUCT,
      status: ProductStatus.ACTIVE, trackInventory: true, costPrice: 0, sellingPrice: 0,
      ...defaultValues,
    },
  });
  const { categories, loadCategories } = useCategories();
  const { brands, loadBrands } = useBrands();
  const { units } = useUnits();

  useEffect(() => {
    const context = storeContext.getStore();
    const tenantId = context?.tenantId ?? "";
    const storeId = context?.storeId ?? "";
    if (!tenantId || !storeId) return;
    void loadCategories(tenantId, storeId);
    void loadBrands(tenantId, storeId);
  }, [loadCategories, loadBrands]);

  const fieldClass = "w-full rounded border p-2";
  const labelClass = "mb-1 block text-sm font-medium text-gray-700";
  const errorClass = "mt-1 text-sm text-red-600";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border bg-white p-6">
      <div><label className={labelClass}>{t("products.productName")}</label><input {...register("name")} placeholder={t("products.productName")} className={fieldClass} />{errors.name && <p className={errorClass}>{errors.name.message}</p>}</div>
      <div><label className={labelClass}>{t("products.sku")}</label><input {...register("sku")} placeholder={t("products.sku")} className={fieldClass} />{errors.sku && <p className={errorClass}>{errors.sku.message}</p>}</div>
      <div><label className={labelClass}>{t("products.category")}</label><select {...register("categoryId")} className={fieldClass}><option value="">{t("products.selectCategory")}</option>{categories.filter((category) => category.status === "active").map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{errors.categoryId && <p className={errorClass}>{errors.categoryId.message}</p>}</div>
      <div><label className={labelClass}>{t("products.brand")}</label><select {...register("brandId")} className={fieldClass}><option value="">{t("products.selectBrand")}</option>{brands.filter((brand) => brand.status === "active").map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select>{errors.brandId && <p className={errorClass}>{errors.brandId.message}</p>}</div>
      <div><label className={labelClass}>{t("products.unit")}</label><select {...register("unitId")} className={fieldClass}><option value="">{t("products.selectUnit")}</option>{units.filter((unit) => unit.status === "active").map((unit) => <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>)}</select>{errors.unitId && <p className={errorClass}>{errors.unitId.message}</p>}</div>
      <div><label className={labelClass}>{t("products.currency")}</label><input {...register("currency")} placeholder={t("products.currency")} className={fieldClass} />{errors.currency && <p className={errorClass}>{errors.currency.message}</p>}</div>
      <div><label className={labelClass}>{t("products.barcode")}</label><input {...register("barcode")} placeholder={t("products.barcode")} className={fieldClass} /></div>
      <div><label className={labelClass}>{t("products.costPrice")}</label><input type="number" step="0.01" {...register("costPrice", { valueAsNumber: true })} placeholder={t("products.costPrice")} className={fieldClass} />{errors.costPrice && <p className={errorClass}>{errors.costPrice.message}</p>}</div>
      <div><label className={labelClass}>{t("products.sellingPrice")}</label><input type="number" step="0.01" {...register("sellingPrice", { valueAsNumber: true })} placeholder={t("products.sellingPrice")} className={fieldClass} />{errors.sellingPrice && <p className={errorClass}>{errors.sellingPrice.message}</p>}</div>
      <div><label className={labelClass}>{t("common.description")}</label><textarea {...register("description")} placeholder={t("common.description")} className={fieldClass} /></div>
      <label className="flex items-center gap-2"><input type="checkbox" {...register("trackInventory")} /><span className="text-sm font-medium text-gray-700">{t("products.trackInventory")}</span></label>
      <button type="submit" disabled={loading} className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? t("products.saving") : t("products.saveProduct")}</button>
    </form>
  );
}
