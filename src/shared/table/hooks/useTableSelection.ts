import { useState } from "react";

export function useTableSelection() {
  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  function toggle(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id,
          )
        : [...current, id],
    );
  }

  function clear() {
    setSelectedIds([]);
  }

  return {
    selectedIds,
    toggle,
    clear,
  };
}