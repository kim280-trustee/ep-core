import type { ReactNode } from "react";

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (row: T) => ReactNode;
}

export interface TablePaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface TableSort {
  column: string;
  direction: "asc" | "desc";
}

export interface TableSelection {
  selectedIds: string[];
}