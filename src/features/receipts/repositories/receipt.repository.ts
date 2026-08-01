import type {
  Receipt,
} from "../types/receipt.types";

export interface ReceiptRepository {

  findAll(): Receipt[];

  findById(
    id: string,
  ): Receipt | undefined;

  findBySalesOrderId(
    salesOrderId: string,
  ): Receipt | undefined;

  create(
    receipt: Receipt,
  ): Receipt;

  update(
    id: string,
    updates: Partial<Receipt>,
  ): Receipt | undefined;

}