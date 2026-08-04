/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Audit Event Listener
 * ============================================================
 */

import {
  eventBus,
} from "@/core/events";

import {
  auditService,
} from "../services/audit.service";

import type {
  GoodsReceipt,
} from "@/features/purchase-receiving/types/goods-receipt.types";

export function registerAuditEventListeners() {

  eventBus.subscribe<GoodsReceipt>(
    "GOODS_RECEIPT_CREATED",
    (event) => {

      auditService.record({

        id: crypto.randomUUID(),

        tenantId: event.payload.tenantId,

        userId: event.payload.receivedBy ?? "",

        entity: "GoodsReceipt",

        entityId: event.payload.id,

        action: "CREATE",

        description: "Goods Receipt Created",

        timestamp: event.timestamp,

        metadata: event.payload,

      });

    },
  );

}