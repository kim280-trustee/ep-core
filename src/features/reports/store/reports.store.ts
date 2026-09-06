import { create } from "zustand";
import type {
  ReportFilter,
  ReportSummary,
} from "../types";
import { reportService } from "../services";

interface ReportsState {
  summary: ReportSummary | null;
  loading: boolean;
  error: string | null;
  filter: ReportFilter | null;

  load: (filter: ReportFilter) => Promise<void>;
  clear: () => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  summary: null,
  loading: false,
  error: null,
  filter: null,

  load: async (filter) => {
    set({
      loading: true,
      error: null,
      filter,
    });

    try {
      const summary = await reportService.getSummary(filter);

      set({
        summary,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load reports.",
      });
    }
  },

  clear: () => {
    set({
      summary: null,
      loading: false,
      error: null,
      filter: null,
    });
  },
}));
