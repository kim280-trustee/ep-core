import { Link } from "react-router-dom";
import { useTranslation } from "../../../core/i18n/useTranslation";

interface SupplierToolbarProps {
  search: string;
  onSearchChange(value: string): void;
}

export function SupplierToolbar({ search, onSearchChange }: SupplierToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 mb-6 sm:flex-row">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t("common.search")}
        className="border rounded p-2 flex-1"
      />
      <div className="flex gap-2">
        <Link to="/suppliers/payments" className="border px-4 py-2 rounded">
          Supplier Payments
        </Link>
        <Link to="/suppliers/create" className="bg-black text-white px-4 py-2 rounded">
          {t("suppliers.addSupplier")}
        </Link>
      </div>
    </div>
  );
}
