export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName?: string;

  quantity: number;

  unitPrice: number;

  discountAmount: number;

  taxRate: number;

  taxAmount?: number;

  lineTotal: number;
}