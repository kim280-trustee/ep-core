export interface SaleItem {

  id: string;

  saleId: string;

  productId: string;

  productName?: string;

  sku?: string;

  quantity: number;

  unitPrice: number;

  costPrice?: number;

  discountAmount?: number;

  taxRate: number;

  lineTotal: number;

}