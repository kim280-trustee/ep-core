/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Sales Processing Engine
 * ============================================================
 */

import type { SalesOrder } from "../types/sales-order.types";

class SalesProcessingEngine {
  process(
    order: SalesOrder,
  ): SalesOrder {
    return {
      ...order,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const salesProcessingEngine =
  new SalesProcessingEngine();