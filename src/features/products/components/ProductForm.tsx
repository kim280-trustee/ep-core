import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, type ProductFormInput, type ProductFormValues } from "../schemas/product.schema";
import { ProductStatus, ProductType } from "../types/product.types";
import { useCategories } from "@/features/categories";
import { useCategoriesStore } from "@/features/categories/store/categories.store";
import { useBrands } from "@/features/brands";
import { useBrandsStore } from "@/features/brands/store/brands.store";
import { useUnits } from "@/features/units";
import { storeContext } from "@/core/store/store.context";
import { useTranslation } from "@/core/i18n/useTranslation";

interface ProductFormProps {
  defaultValues?: Partial<ProductFormInput>;
  onSubmit?: (values: ProductFormValues) => void;
  loading?: boolean;
}

type QuickCreateType = "category" | "brand" | null;

export function ProductForm({ defaultValues, onSubmit = () => {}, loading = false }: ProductFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput, undefined, ProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      currency: "THB",
      productType: ProductType.PRODUCT,
      status: ProductStatus.ACTIVE,
      trackInventory: true,
      costPrice: 0,
      sellingPrice: 0,
      ...defaultValues,
    },
  });

  const { categories, loadCategories, createCategory } = useCategories();
  const { brands, loadBrands, createBrand } = useBrands();
  const { units } = useUnits();

  const [quickCreateType, setQuickCreateType] = useState<QuickCreateType>(null);
  const [quickCreateName, setQuickCreateName] = useState("");
  const [quickCreateLoading, setQuickCreateLoading] = useState(false);
  const [quickCreateError, setQuickCreateError] = useState("");

  const getStoreContext = () => {
    const context = storeContext.getStore();
    return {
      tenantId: context?.tenantId ?? "",
      storeId: context?.storeId ?? "",
    };
  };

  useEffect(() => {
    const { tenantId, storeId } = getStoreContext();
    if (!tenantId || !storeId) return;

    void loadCategories(tenantId, storeId);
    void loadBrands(tenantId, storeId);
  }, [loadCategories, loadBrands]);

  const openQuickCreate = (type: QuickCreateType) => {
    setQuickCreateType(type);
    setQuickCreateName("");
    setQuickCreateError("");
  };

  const closeQuickCreate = () => {
    if (quickCreateLoading) return;
    setQuickCreateType(null);
    setQuickCreateName("");
    setQuickCreateError("");
  };

  const handleQuickCreate = async () => {
    const name = quickCreateName.trim();

    if (!name || !quickCreateType) {
      setQuickCreateError("Please enter a name.");
      return;
    }

    const { tenantId, storeId } = getStoreContext();

    if (!tenantId || !storeId) {
      setQuickCreateError("Store context is not available.");
      return;
    }

    setQuickCreateLoading(true);
    setQuickCreateError("");

    try {
      if (quickCreateType === "category") {
        const existing = categories.find(
          (category) =>
            category.status === "active" &&
            category.name.trim().toLowerCase() === name.toLowerCase(),
        );

        if (existing) {
          setValue("categoryId", existing.id, { shouldValidate: true });
          closeQuickCreate();
          return;
        }

        await createCategory({ name }, tenantId, storeId);

        const created = useCategoriesStore
          .getState()
          .categories.find(
            (category) =>
              category.status === "active" &&
              category.name.trim().toLowerCase() === name.toLowerCase(),
          );

        if (created) {
          setValue("categoryId", created.id, { shouldValidate: true });
          closeQuickCreate();
          return;
        }

        setQuickCreateError("Category was created, but could not be selected automatically.");
      } else {
        const existing = brands.find(
          (brand) =>
            brand.status === "active" &&
            brand.name.trim().toLowerCase() === name.toLowerCase(),
        );

        if (existing) {
          setValue("brandId", existing.id, { shouldValidate: true });
          closeQuickCreate();
          return;
        }

        await createBrand({ name }, tenantId, storeId);

        const created = useBrandsStore
          .getState()
          .brands.find(
            (brand) =>
              brand.status === "active" &&
              brand.name.trim().toLowerCase() === name.toLowerCase(),
          );

        if (created) {
          setValue("brandId", created.id, { shouldValidate: true });
          closeQuickCreate();
          return;
        }

        setQuickCreateError("Brand was created, but could not be selected automatically.");
      }
    } catch (error) {
      setQuickCreateError(
        error instanceof Error ? error.message : "Could not create the item.",
      );
    } finally {
      setQuickCreateLoading(false);
    }
  };

  const fieldClass = "w-full rounded border p-2";
  const labelClass = "mb-1 block text-sm font-medium text-gray-700";
  const errorClass = "mt-1 text-sm text-red-600";

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border bg-white p-6">
        <div>
          <label className={labelClass}>{t("products.productName")}</label>
          <input {...register("name")} placeholder={t("products.productName")} className={fieldClass} />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div>
          <label className={labelClass}>{t("products.sku")}</label>
          <input {...register("sku")} placeholder={t("products.sku")} className={fieldClass} />
          {errors.sku && <p className={errorClass}>{errors.sku.message}</p>}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">{t("products.category")}</label>
            <button type="button" onClick={() => openQuickCreate("category")} className="text-sm font-medium text-blue-600 hover:text-blue-700">
              + New
            </button>
          </div>
          <select {...register("categoryId")} className={fieldClass}>
            <option value="">{t("products.category")}</option>
            {categories
              .filter((category) => category.status === "active")
              .map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
          </select>
          {errors.categoryId && <p className={errorClass}>{errors.categoryId.message}</p>}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">{t("products.brand")}</label>
            <button type="button" onClick={() => openQuickCreate("brand")} className="text-sm font-medium text-blue-600 hover:text-blue-700">
              + New
            </button>
          </div>
          <select {...register("brandId")} className={fieldClass}>
            <option value="">{t("products.brand")}</option>
            {brands
              .filter((brand) => brand.status === "active")
              .map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
          </select>
          {errors.brandId && <p className={errorClass}>{errors.brandId.message}</p>}
        </div>

        <div>
          <label className={labelClass}>{t("products.unit")}</label>
          <select {...register("unitId")} className={fieldClass}>
            <option value="">{t("products.unit")}</option>
            {units
              .filter((unit) => unit.status === "active")
              .map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>
              ))}
          </select>
          {errors.unitId && <p className={errorClass}>{errors.unitId.message}</p>}
        </div>

        <div>
          <label className={labelClass}>{t("products.currency")}</label>
          <input {...register("currency")} placeholder={t("products.currency")} className={fieldClass} />
          {errors.currency && <p className={errorClass}>{errors.currency.message}</p>}
        </div>

        <div>
          <label className={labelClass}>{t("products.barcode")}</label>
          <input {...register("barcode")} placeholder={t("products.barcode")} className={fieldClass} />
        </div>

        <div>
          <label className={labelClass}>{t("products.costPrice")}</label>
          <input type="number" step="0.01" {...register("costPrice", { valueAsNumber: true })} placeholder={t("products.costPrice")} className={fieldClass} />
          {errors.costPrice && <p className={errorClass}>{errors.costPrice.message}</p>}
        </div>

        <div>
          <label className={labelClass}>{t("products.sellingPrice")}</label>
          <input type="number" step="0.01" {...register("sellingPrice", { valueAsNumber: true })} placeholder={t("products.sellingPrice")} className={fieldClass} />
          {errors.sellingPrice && <p className={errorClass}>{errors.sellingPrice.message}</p>}
        </div>

        <div>
          <label className={labelClass}>{t("common.description")}</label>
          <textarea {...register("description")} placeholder={t("common.description")} className={fieldClass} />
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("trackInventory")} />
          <span className="text-sm font-medium text-gray-700">{t("products.trackInventory")}</span>
        </label>

        <button type="submit" disabled={loading} className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? t("products.saving") : t("products.saveProduct")}
        </button>
      </form>

      {quickCreateType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Create {quickCreateType === "category" ? "Category" : "Brand"}
              </h2>
              <button type="button" onClick={closeQuickCreate} disabled={quickCreateLoading} className="text-xl text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>

            <label className={labelClass}>
              {quickCreateType === "category" ? "Category Name" : "Brand Name"}
            </label>
            <input
              autoFocus
              value={quickCreateName}
              onChange={(event) => setQuickCreateName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleQuickCreate();
                }
              }}
              placeholder={"Enter " + quickCreateType + " name"}
              className={fieldClass}
              disabled={quickCreateLoading}
            />

            {quickCreateError && <p className={errorClass}>{quickCreateError}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closeQuickCreate} disabled={quickCreateLoading} className="rounded border px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button type="button" onClick={() => void handleQuickCreate()} disabled={quickCreateLoading || !quickCreateName.trim()} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {quickCreateLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
