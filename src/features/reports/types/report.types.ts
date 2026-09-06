export interface ReportDateRange {
  from?: string;
  to?: string;
}

export interface ReportFilter {
  tenantId: string;
  storeId?: string;
  warehouseId?: string;
  currency?: string;
  dateRange?: ReportDateRange;
}

export interface ReportCurrencySummary {
  currency: string;
  sales: number;
  purchases: number;
  expenses: number;
  cogs: number;
  grossProfit: number;
  netProfit: number;
  inventoryValue: number;
}

export interface ReportSalesRow {
  orderNumber: string;
  date: string;
  customerName: string;
  warehouseName: string;
  itemCount: number;
  totalAmount: number;
  paymentStatus: string;
  status: string;
}

export interface ReportPurchaseRow {
  orderNumber: string;
  date: string;
  supplierName: string;
  warehouseName: string;
  receivedQuantity: number;
  totalQuantity: number;
  totalAmount: number;
  currency: string;
  status: string;
}

export interface ReportExpenseRow {
  date: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
}

export interface ReportInventoryRow {
  productName: string;
  warehouseName: string;
  quantityOnHand: number;
  availableQuantity: number;
  averageCost: number;
  inventoryValue: number;
  minimumStockLevel: number;
  stockStatus: "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK";
}

export interface ReportSummary {
  currencies: ReportCurrencySummary[];
  completedSalesCount: number;
  purchaseOrderCount: number;
  expenseCount: number;
  salesRows: ReportSalesRow[];
  purchaseRows: ReportPurchaseRow[];
  expenseRows: ReportExpenseRow[];
  inventoryRows: ReportInventoryRow[];
}

export interface ReportMetric {
  label: string;
  value: number;
  currency?: string;
}

export interface ReportDashboardData {
  summary: ReportSummary;
  metrics: ReportMetric[];
}
