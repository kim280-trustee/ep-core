import { useEffect } from "react";
import { useDashboardStore } from "../store/dashboard.store";

export function useDashboard() {
  const data =
    useDashboardStore(
      (state) => state.data,
    );

  const loading =
    useDashboardStore(
      (state) => state.loading,
    );

  const error =
    useDashboardStore(
      (state) => state.error,
    );

  const loadDashboard =
    useDashboardStore(
      (state) => state.loadDashboard,
    );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return {
    data,
    loading,
    error,
  };
}
