export interface CompanySettings {
  id: string;
  tenantId: string;
  businessName: string;
  country: string;
  currency: string;
  language?: "en" | "th" | "sw";
  taxEnabled: boolean;
  taxRate: number;
  invoicePrefix: string;
  receiptPrefix: string;
  createdAt: string;
  updatedAt: string;
}
