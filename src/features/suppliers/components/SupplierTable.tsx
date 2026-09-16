import { Link } from "react-router-dom";
import type { Supplier } from "../types/supplier.types";
import { useTranslation } from "../../../core/i18n/useTranslation";

interface SupplierTableProps {
  suppliers: Supplier[];
  onDelete(id: string): void;
}

export function SupplierTable({ suppliers, onDelete }: SupplierTableProps) {
  const { t } = useTranslation();

  if (suppliers.length === 0) {
    return <div className="border rounded p-8 text-center">{t("suppliers.noSuppliers")}</div>;
  }

  return (
    <>
      <div className="space-y-3 sm:hidden">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{supplier.name}</p>
              <p className="mt-1 text-sm text-slate-600">{supplier.contactPerson || "-"}</p>
              <p className="mt-1 text-sm text-slate-600">{supplier.phone || "-"}</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Link
                to={`/suppliers/${supplier.id}/ledger`}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border px-3 py-2 text-sm underline"
              >
                Ledger
              </Link>
              <Link
                to={`/suppliers/${supplier.id}/edit`}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border px-3 py-2 text-sm underline"
              >
                {t("suppliers.editSupplier")}
              </Link>
              <button
                type="button"
                onClick={() => onDelete(supplier.id)}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">{t("common.name")}</th>
              <th className="text-left p-3">{t("suppliers.contactName")}</th>
              <th className="text-left p-3">{t("suppliers.phone")}</th>
              <th className="text-left p-3">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-b">
                <td className="p-3">{supplier.name}</td>
                <td className="p-3">{supplier.contactPerson || "-"}</td>
                <td className="p-3">{supplier.phone || "-"}</td>
                <td className="p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link to={`/suppliers/${supplier.id}/ledger`} className="underline">Ledger</Link>
                    <Link to={`/suppliers/${supplier.id}/edit`} className="underline">{t("suppliers.editSupplier")}</Link>
                    <button type="button" onClick={() => onDelete(supplier.id)} className="text-red-600">{t("common.delete")}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
