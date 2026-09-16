import { Link } from "react-router-dom";
import { useTranslation } from "@/core/i18n/useTranslation";
import type { Product } from "../types/product.types";

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
}

export function ProductTable({ products, loading = false }: ProductTableProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        {t("products.loadingProducts")}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 sm:hidden">
        {products.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
            {t("products.noProducts")}
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">{product.name}</p>
                <p className="mt-1 text-sm text-gray-600">{t("products.sku")}: {product.sku}</p>
                <p className="mt-1 text-sm text-gray-600">{t("products.barcode")}: {product.barcode || "-"}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">{t("products.costPrice")}</p>
                  <p className="font-medium">{Number(product.costPrice || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t("products.sellingPrice")}</p>
                  <p className="font-medium">{Number(product.sellingPrice || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm text-gray-600">
                  {product.status === "ACTIVE" ? t("products.active") : t("products.inactive")}
                </span>
                <Link
                  to={`/products/${product.id}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600"
                >
                  {t("products.view")}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border bg-white sm:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">{t("common.name")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("products.sku")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("products.barcode")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("products.costPrice")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("products.sellingPrice")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("common.status")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  {t("products.noProducts")}
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3">{product.sku}</td>
                <td className="px-4 py-3">{product.barcode || "-"}</td>
                <td className="px-4 py-3 text-right">{Number(product.costPrice || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{Number(product.sellingPrice || 0).toFixed(2)}</td>
                <td className="px-4 py-3">{product.status === "ACTIVE" ? t("products.active") : t("products.inactive")}</td>
                <td className="px-4 py-3">
                  <Link to={`/products/${product.id}`} className="text-blue-600 hover:underline">
                    {t("products.view")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
