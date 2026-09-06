import type {
  ReportCurrencySummary,
  ReportDateRange,
} from "../types";

export interface ReportSalesSource {
  storeId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportPurchaseItemSource {
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
}

export interface ReportPurchaseSource {
  storeId: string | null;
  status: string;
  currency: string;
  totalAmount: number;
  orderDate: string;
  updatedAt: string;
  items: ReportPurchaseItemSource[];
}

export interface ReportExpenseSource {
  currency: string;
  amount: number;
  expenseDate: string;
}

export interface ReportInventorySource {
  warehouseId: string;
  quantityOnHand: number;
  averageCost: number;
}

export interface ReportSalesCostSource {
  storeId: string;
  warehouseId: string;
  movementType?: string;
  type?: string;
  quantity: number;
  unitCost?: number;
  referenceId?: string;
  createdAt: string;
}

export interface ReportCalculationInput {
  sales: ReportSalesSource[];
  purchases: ReportPurchaseSource[];
  expenses: ReportExpenseSource[];
  inventory: ReportInventorySource[];
  inventoryTransactions?: ReportSalesCostSource[];
  filter: {
    storeId?: string;
    warehouseId?: string;
    currency?: string;
    dateRange?: ReportDateRange;
    storeWarehouseIds?: string[];
  };
}

const normalizeCurrency = (currency: string): string =>
  currency.trim().toUpperCase();

const inRange = (
  date: string,
  range?: ReportDateRange,
): boolean => {
  if (!range) return true;

  const value = date.slice(0, 10);

  if (range.from && value < range.from.slice(0, 10)) {
    return false;
  }

  if (range.to && value > range.to.slice(0, 10)) {
    return false;
  }

  return true;
};

export class ReportEngine {
  calculate(input: ReportCalculationInput): {
    currencies: ReportCurrencySummary[];
    completedSalesCount: number;
    purchaseOrderCount: number;
    expenseCount: number;
  } {
    const totals = new Map<string, ReportCurrencySummary>();

    const getCurrency = (
      currency: string,
    ): ReportCurrencySummary => {
      const key = normalizeCurrency(currency);

      const existing = totals.get(key);
      if (existing) return existing;

      const value: ReportCurrencySummary = {
        currency: key,
        sales: 0,
        purchases: 0,
        expenses: 0,
        cogs: 0,
        grossProfit: 0,
        netProfit: 0,
        inventoryValue: 0,
      };

      totals.set(key, value);
      return value;
    };

    let completedSalesCount = 0;
    let purchaseOrderCount = 0;
    let expenseCount = 0;

    for (const sale of input.sales) {
      if (
        input.filter.storeId &&
        sale.storeId !== input.filter.storeId
      ) {
        continue;
      }

      if (sale.status !== "COMPLETED") continue;

      if (
        !inRange(
          sale.createdAt,
          input.filter.dateRange,
        )
      ) {
        continue;
      }

      if (!input.filter.currency) continue;

      const summary = getCurrency(
        input.filter.currency,
      );

      summary.sales +=
        Number(sale.totalAmount) || 0;

      completedSalesCount += 1;
    }

    for (const purchase of input.purchases) {
      if (
        input.filter.storeId &&
        purchase.storeId !== input.filter.storeId
      ) {
        continue;
      }

      if (
        purchase.status !== "RECEIVED" &&
        purchase.status !== "PARTIALLY_RECEIVED"
      ) {
        continue;
      }

      if (
        !inRange(
          purchase.orderDate || purchase.updatedAt,
          input.filter.dateRange,
        )
      ) {
        continue;
      }

      const currency = normalizeCurrency(
        purchase.currency,
      );

      if (
        input.filter.currency &&
        currency !==
          normalizeCurrency(
            input.filter.currency,
          )
      ) {
        continue;
      }

      const summary = getCurrency(currency);

      for (const item of purchase.items) {
        const receivedQuantity = Math.max(
          0,
          Number(item.receivedQuantity) || 0,
        );

        const unitCost =
          Number(item.unitCost) || 0;

        summary.purchases +=
          receivedQuantity * unitCost;
      }

      purchaseOrderCount += 1;
    }

    for (const expense of input.expenses) {
      if (
        !inRange(
          expense.expenseDate,
          input.filter.dateRange,
        )
      ) {
        continue;
      }

      const currency = normalizeCurrency(
        expense.currency,
      );

      if (
        input.filter.currency &&
        currency !==
          normalizeCurrency(
            input.filter.currency,
          )
      ) {
        continue;
      }

      const summary = getCurrency(currency);

      summary.expenses +=
        Number(expense.amount) || 0;

      expenseCount += 1;
    }

    if (input.filter.currency) {
      const summary = getCurrency(
        input.filter.currency,
      );

      const allowedWarehouseIds =
        input.filter.storeWarehouseIds;

      for (const record of input.inventory) {
        if (
          input.filter.warehouseId &&
          record.warehouseId !==
            input.filter.warehouseId
        ) {
          continue;
        }

        if (
          allowedWarehouseIds &&
          !allowedWarehouseIds.includes(
            record.warehouseId,
          )
        ) {
          continue;
        }

        const quantity =
          Number(record.quantityOnHand) || 0;

        const averageCost =
          Number(record.averageCost) || 0;

        summary.inventoryValue +=
          quantity * averageCost;
      }
    }

    if (
      input.filter.currency &&
      input.inventoryTransactions
    ) {
      const summary = getCurrency(
        input.filter.currency,
      );

      for (
        const transaction of
        input.inventoryTransactions
      ) {
        if (
          input.filter.storeId &&
          transaction.storeId !==
            input.filter.storeId
        ) {
          continue;
        }

        if (
          input.filter.warehouseId &&
          transaction.warehouseId !==
            input.filter.warehouseId
        ) {
          continue;
        }

        if (
          !inRange(
            transaction.createdAt,
            input.filter.dateRange,
          )
        ) {
          continue;
        }

        const movementType = (
          transaction.movementType ||
          transaction.type ||
          ""
        ).toUpperCase();

        const quantity =
          Math.abs(
            Number(transaction.quantity) || 0,
          );

        const unitCost =
          Number(transaction.unitCost) || 0;

        const amount =
          quantity * unitCost;

        if (movementType === "SALE") {
          summary.cogs += amount;
        }

        if (
          movementType === "SALE_RETURN"
        ) {
          summary.cogs -= amount;
        }
      }
    }

    for (const summary of totals.values()) {
      summary.grossProfit =
        summary.sales - summary.cogs;

      summary.netProfit =
        summary.grossProfit -
        summary.expenses;
    }

    return {
      currencies: [...totals.values()],
      completedSalesCount,
      purchaseOrderCount,
      expenseCount,
    };
  }
}

export const reportEngine =
  new ReportEngine();
