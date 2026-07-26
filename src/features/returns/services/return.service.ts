import { returnRepository } from "../repositories";

import type { Return, ReturnItem } from "../types";

export interface CreateReturnInput {
  tenantId: string;
  storeId: string;
  warehouseId: string;
  saleId: string;
  items: ReturnItem[];
  refundAmount: number;
}

class ReturnService {
  createReturn(
    input: CreateReturnInput,
  ): Return {
    const value: Return = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      storeId: input.storeId,
      warehouseId: input.warehouseId,
      saleId: input.saleId,
      returnNumber: `RET-${Date.now()}`,
      status: "COMPLETED",
      items: input.items,
      subtotal: input.refundAmount,
      refundAmount: input.refundAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return returnRepository.create(value);
  }

  getReturns(): Return[] {
    return returnRepository.findAll();
  }

  getReturnById(
    id: string,
  ): Return | undefined {
    return returnRepository.findById(id);
  }

  getReturnsBySaleId(
    saleId: string,
  ): Return[] {
    return returnRepository.findBySaleId(saleId);
  }
}

export const returnService =
  new ReturnService();