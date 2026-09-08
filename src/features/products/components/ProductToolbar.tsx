import { Search } from "lucide-react";
import { useTranslation } from "@/core/i18n/useTranslation";
import type { ProductFilters, ProductStatus } from "../types/product.types";

interface ProductToolbarProps {
  filters: ProductFilters;
  updateFilters: (filters: Partial<ProductFilters>) => void;
}

export function ProductToolbar({ filters, updateFilters }: ProductToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          value={filters.search ?? ""}
          onChange={(event) => updateFilters({ search: event.target.value })}
          placeholder={t("products.searchProducts")}
          className="w-full rounded-lg border py-2 pl-10 pr-3"
        />
      </div>

      <select
        value={filters.status ?? "ALL"}
        onChange={(event) =>
          updateFilters({
            status:
              event.target.value === "ALL"
                ? undefined
                : (event.target.value as ProductStatus),
          })
        }
        className="rounded-lg border px-3 py-2"
      >
        <option value="ALL">{t("products.allStatus")}</option>
        <option value="ACTIVE">{t("products.active")}</option>
        <option value="INACTIVE">{t("products.inactive")}</option>
      </select>
    </div>
  );
}
