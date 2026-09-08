import { useTranslation } from "@/core/i18n/useTranslation";

interface InventoryToolbarProps {
  onRefresh: () => void;
}

export function InventoryToolbar({ onRefresh }: InventoryToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold">{t("inventory.title")}</h2>
      <button
        onClick={onRefresh}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        {t("inventory.refresh")}
      </button>
    </div>
  );
}
