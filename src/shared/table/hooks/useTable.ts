import { useState } from "react";

import type {
  TablePaginationState,
  TableSort,
} from "../types/table.types";

export function useTable() {
  const [pagination, setPagination] =
    useState<TablePaginationState>({
      page: 1,
      pageSize: 10,
      totalItems: 0,
    });

  const [sort, setSort] =
    useState<TableSort | null>(null);

  return {
    pagination,
    setPagination,

    sort,
    setSort,
  };
}