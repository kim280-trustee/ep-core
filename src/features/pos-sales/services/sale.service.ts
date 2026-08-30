import {
  getSaleRepository,
} from "../repositories";

import type {
  Sale,
  SaleItem,
} from "../types";

interface CreateSaleInput {
  tenantId: string;
  storeId: string;
  warehouseId: string;
  customerId?: string;
  cashierId?: string;
}

function roundMoney(
  value: number,
): number {
  return Math.round(
    (value + Number.EPSILON) * 100,
  ) / 100;
}

class SaleService {
  createSale(
    input: CreateSaleInput,
  ): Sale {
    const now =
      new Date().toISOString();

    const sale: Sale = {
      id:
        crypto.randomUUID(),

      tenantId:
        input.tenantId,

      storeId:
        input.storeId,

      warehouseId:
        input.warehouseId,

      customerId:
        input.customerId,

      cashierId:
        input.cashierId,

      saleNumber:
        `SALE-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,

      status:
        "COMPLETED",

      items: [],

      subtotal: 0,

      discountAmount: 0,

      taxAmount: 0,

      totalAmount: 0,

      paymentStatus:
        "PENDING",

      createdAt:
        now,

      updatedAt:
        now,
    };

    return getSaleRepository()
      .create(sale);
  }

  addItem(
    saleId: string,
    item: SaleItem,
  ) {
    const sale =
      this.getSaleById(
        saleId,
      );

    if (!sale) {
      throw new Error(
        "Sale not found.",
      );
    }

    const items = [
      ...sale.items,
      item,
    ];

    return getSaleRepository()
      .update(
        saleId,
        {
          items,
          ...this.calculateTotals(
            items,
          ),
        },
      );
  }

  addItems(
    saleId: string,
    items: SaleItem[],
  ) {
    const sale =
      this.getSaleById(
        saleId,
      );

    if (!sale) {
      throw new Error(
        "Sale not found.",
      );
    }

    return getSaleRepository()
      .update(
        saleId,
        {
          items: [...items],
          ...this.calculateTotals(
            items,
          ),
        },
      );
  }

  completePayment(
    saleId: string,
    paymentMethod: string,
  ) {
    if (!paymentMethod.trim()) {
      throw new Error(
        "Payment method is required.",
      );
    }

    return getSaleRepository()
      .update(
        saleId,
        {
          paymentStatus:
            "PAID",
          paymentMethod,
          completedAt:
            new Date().toISOString(),
        },
      );
  }

  completeSale(
    saleId: string,
  ) {
    return getSaleRepository()
      .update(
        saleId,
        {
          paymentStatus:
            "PAID",
          completedAt:
            new Date().toISOString(),
        },
      );
  }

  voidSale(
    saleId: string,
  ) {
    return getSaleRepository()
      .update(
        saleId,
        {
          status:
            "VOIDED",
        },
      );
  }

  getSales() {
    return getSaleRepository()
      .findAll();
  }

  getSaleById(
    id: string,
  ) {
    return getSaleRepository()
      .findById(id);
  }

  private calculateTotals(
    items: SaleItem[],
  ) {
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    for (const item of items) {
      const itemSubtotal =
        roundMoney(
          item.quantity *
            item.unitPrice,
        );

      const discount =
        roundMoney(
          Math.min(
            Math.max(
              0,
              item.discountAmount ?? 0,
            ),
            itemSubtotal,
          ),
        );

      const taxableAmount =
        roundMoney(
          itemSubtotal -
            discount,
        );

      const tax =
        roundMoney(
          taxableAmount *
            ((item.taxRate ?? 0) / 100),
        );

      subtotal =
        roundMoney(
          subtotal +
            itemSubtotal,
        );

      discountAmount =
        roundMoney(
          discountAmount +
            discount,
        );

      taxAmount =
        roundMoney(
          taxAmount +
            tax,
        );
    }

    return {
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount:
        roundMoney(
          subtotal -
            discountAmount +
            taxAmount,
        ),
    };
  }
}

export const saleService =
  new SaleService();