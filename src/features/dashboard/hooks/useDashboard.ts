/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Dashboard Hook
 * ============================================================
 */

import {
  useEffect,
} from "react";

import {
  useDashboardStore,
} from "../store/dashboard.store";


export function useDashboard() {


  const summary =
    useDashboardStore(
      (state) =>
        state.summary,
    );


  const loadDashboard =
    useDashboardStore(
      (state) =>
        state.loadDashboard,
    );



  useEffect(() => {

    loadDashboard();

  }, [loadDashboard]);



  return {

    summary,

  };

}