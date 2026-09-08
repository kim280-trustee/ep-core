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
            <td className="p-3 flex gap-3">
              <Link to={`/suppliers/edit/${supplier.id}`} className="underline">
                {t("suppliers.editSupplier")}
              </Link>
              <button onClick={() => onDelete(supplier.id)} className="text-red-600">
                {t("common.delete")}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
