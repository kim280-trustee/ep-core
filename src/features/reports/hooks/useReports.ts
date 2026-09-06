import { useEffect } from "react";
import type { ReportFilter } from "../types";
import { useReportsStore } from "../store";

export function useReports(filter: ReportFilter | null) {
  const summary = useReportsStore((state) => state.summary);
  const loading = useReportsStore((state) => state.loading);
  const error = useReportsStore((state) => state.error);
  const load = useReportsStore((state) => state.load);

  useEffect(() => {
    if (!filter?.tenantId) return;

    void load(filter);
  }, [
    filter?.tenantId,
    filter?.storeId,
    filter?.warehouseId,
    filter?.currency,
    filter?.dateRange?.from,
    filter?.dateRange?.to,
    load,
  ]);

  return {
    summary,
    loading,
    error,
  };
}
