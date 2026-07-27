interface InventoryToolbarProps {

  onRefresh: () => void;

}

export function InventoryToolbar({
  onRefresh,
}: InventoryToolbarProps) {

  return (

    <div className="flex items-center justify-between mb-4">

      <h2 className="text-xl font-semibold">

        Inventory

      </h2>

      <button
        onClick={onRefresh}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        Refresh
      </button>

    </div>

  );

}