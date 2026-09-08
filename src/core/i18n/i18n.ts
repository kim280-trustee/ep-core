import { en } from "./locales/en";
import { th } from "./locales/th";
import { sw } from "./locales/sw";

export const languages = { en, th, sw };
export type Language = keyof typeof languages;

let currentLanguage: Language = "en";
const listeners = new Set<() => void>();

const supplementalTranslations: Partial<Record<Language, Record<string, string>>> = {
  en: {
    "customers.customerNotFound": "Customer not found",
    "customers.customerNotFoundDescription": "The requested customer could not be found.",
    "purchasing.createPurchaseOrderDescription": "Create a purchase order for stock you need from a supplier.",
    "purchasing.supplierRequired": "Please select a supplier.",
    "purchasing.warehouseRequired": "Please select a warehouse.",
    "purchasing.failedToCreatePurchaseOrder": "Failed to create purchase order.",
    "purchasing.orderSetupDescription": "Choose the supplier, warehouse, and notes for this order.",
    "purchasing.supplierQuestion": "Who are you ordering stock from?",
    "purchasing.selectSupplier": "Select Supplier",
    "purchasing.warehouseQuestion": "Where should the stock be received?",
    "purchasing.loadingWarehouses": "Loading warehouses...",
    "purchasing.selectWarehouse": "Select Warehouse",
    "purchasing.notesDescription": "Add any notes or instructions for this order.",
    "purchasing.notesPlaceholder": "Optional notes for the supplier",
    "purchasing.draftDescription": "This order will be saved as a draft until you submit it.",
    "purchasing.createDraft": "Create Draft",
    "purchasing.productSelectionRequired": "Please select a product from the search results.",
    "purchasing.unitCostZeroOrGreater": "Unit cost must be zero or greater.",
    "purchasing.taxRateZeroOrGreater": "Tax rate must be zero or greater.",
    "purchasing.failedToAddPurchaseOrderItem": "Failed to add purchase order item.",
    "purchasing.productSearchDescription": "Search by product name, SKU, or barcode.",
    "purchasing.productSearchPlaceholder": "Search product name, SKU, or barcode",
    "purchasing.searchingProducts": "Searching products...",
    "purchasing.unableToSearchProducts": "Unable to search products.",
    "purchasing.noMatchingProducts": "No matching products found.",
    "purchasing.selectedProduct": "Selected Product",
    "purchasing.quantityPlaceholder": "Enter quantity",
    "purchasing.unitCost": "Unit Cost",
    "purchasing.unitCostPlaceholder": "Enter unit cost",
    "purchasing.taxRate": "Tax Rate (%)",
    "purchasing.taxRateShort": "Tax %",
    "purchasing.notesPlaceholderOptional": "Optional notes",
    "purchasing.addingProduct": "Adding...",
    "purchasing.addProductToOrder": "Add Product to Order",
    "purchasing.noProductsInOrder": "No products added yet",
    "purchasing.addProductBeforeSubmit": "Add at least one product before submitting this purchase order.",
    "purchasing.ordered": "Ordered",
    "purchasing.lineTotal": "Line Total",
    "purchasing.purchaseSummary": "Purchase Summary",
    "purchasing.purchaseSummaryDescription": "Financial summary for this purchase order.",
    "purchasing.taxAmount": "Tax Amount",
    "purchasing.totalAmount": "Total Amount",
    "products.deleteTenantUnavailable": "Unable to delete product because the store tenant could not be identified.",
    "products.deleteConfirmation": "This action cannot be undone.",
    "products.unableToDeleteProduct": "Unable to delete product.",
    "products.deleting": "Deleting...",
    "products.productInformation": "Product Information",
    "products.productType": "Product Type",
    "products.productTypeProduct": "Product",
    "products.productTypeService": "Service",
    "products.pricing": "Pricing",
    "products.additionalInformation": "Additional Information",
    "settings.swahili": "Swahili",
  },
  th: {
    "customers.customerNotFound": "ไม่พบลูกค้า",
    "customers.customerNotFoundDescription": "ไม่พบข้อมูลลูกค้าที่ร้องขอ",
    "purchasing.createPurchaseOrderDescription": "สร้างใบสั่งซื้อสำหรับสินค้าที่ต้องการจากซัพพลายเออร์",
    "purchasing.supplierRequired": "กรุณาเลือกซัพพลายเออร์",
    "purchasing.warehouseRequired": "กรุณาเลือกคลังสินค้า",
    "purchasing.failedToCreatePurchaseOrder": "ไม่สามารถสร้างใบสั่งซื้อได้",
    "purchasing.orderSetupDescription": "เลือกซัพพลายเออร์ คลังสินค้า และหมายเหตุสำหรับใบสั่งซื้อนี้",
    "purchasing.supplierQuestion": "คุณกำลังสั่งซื้อสินค้าจากซัพพลายเออร์รายใด",
    "purchasing.selectSupplier": "เลือกซัพพลายเออร์",
    "purchasing.warehouseQuestion": "ต้องการรับสินค้าเข้าคลังสินค้าใด",
    "purchasing.loadingWarehouses": "กำลังโหลดคลังสินค้า...",
    "purchasing.selectWarehouse": "เลือกคลังสินค้า",
    "purchasing.notesDescription": "เพิ่มหมายเหตุหรือคำแนะนำสำหรับใบสั่งซื้อนี้",
    "purchasing.notesPlaceholder": "หมายเหตุเพิ่มเติมสำหรับซัพพลายเออร์",
    "purchasing.draftDescription": "ใบสั่งซื้อนี้จะถูกบันทึกเป็นฉบับร่างจนกว่าจะส่งอนุมัติ",
    "purchasing.createDraft": "สร้างฉบับร่าง",
    "purchasing.productSelectionRequired": "กรุณาเลือกสินค้าจากผลการค้นหา",
    "purchasing.unitCostZeroOrGreater": "ต้นทุนต่อหน่วยต้องไม่น้อยกว่าศูนย์",
    "purchasing.taxRateZeroOrGreater": "อัตราภาษีต้องไม่น้อยกว่าศูนย์",
    "purchasing.failedToAddPurchaseOrderItem": "ไม่สามารถเพิ่มรายการสินค้าในใบสั่งซื้อได้",
    "purchasing.productSearchDescription": "ค้นหาด้วยชื่อสินค้า SKU หรือบาร์โค้ด",
    "purchasing.productSearchPlaceholder": "ค้นหาชื่อสินค้า SKU หรือบาร์โค้ด",
    "purchasing.searchingProducts": "กำลังค้นหาสินค้า...",
    "purchasing.unableToSearchProducts": "ไม่สามารถค้นหาสินค้าได้",
    "purchasing.noMatchingProducts": "ไม่พบสินค้าที่ตรงกับการค้นหา",
    "purchasing.selectedProduct": "สินค้าที่เลือก",
    "purchasing.quantityPlaceholder": "ระบุจำนวน",
    "purchasing.unitCost": "ต้นทุนต่อหน่วย",
    "purchasing.unitCostPlaceholder": "ระบุต้นทุนต่อหน่วย",
    "purchasing.taxRate": "อัตราภาษี (%)",
    "purchasing.taxRateShort": "ภาษี %",
    "purchasing.notesPlaceholderOptional": "หมายเหตุเพิ่มเติม",
    "purchasing.addingProduct": "กำลังเพิ่ม...",
    "purchasing.addProductToOrder": "เพิ่มสินค้าในใบสั่งซื้อ",
    "purchasing.noProductsInOrder": "ยังไม่มีการเพิ่มสินค้า",
    "purchasing.addProductBeforeSubmit": "เพิ่มสินค้าอย่างน้อยหนึ่งรายการก่อนส่งใบสั่งซื้อนี้",
    "purchasing.ordered": "สั่งซื้อ",
    "purchasing.lineTotal": "ยอดรวมรายการ",
    "purchasing.purchaseSummary": "สรุปการซื้อ",
    "purchasing.purchaseSummaryDescription": "สรุปทางการเงินสำหรับใบสั่งซื้อนี้",
    "purchasing.taxAmount": "จำนวนภาษี",
    "purchasing.totalAmount": "ยอดรวมทั้งหมด",
    "products.deleteTenantUnavailable": "ไม่สามารถลบสินค้าได้เนื่องจากไม่พบบริบทของร้านค้า",
    "products.deleteConfirmation": "การดำเนินการนี้ไม่สามารถยกเลิกได้",
    "products.unableToDeleteProduct": "ไม่สามารถลบสินค้าได้",
    "products.deleting": "กำลังลบ...",
    "products.productInformation": "ข้อมูลสินค้า",
    "products.productType": "ประเภทสินค้า",
    "products.productTypeProduct": "สินค้า",
    "products.productTypeService": "บริการ",
    "products.pricing": "ราคา",
    "products.additionalInformation": "ข้อมูลเพิ่มเติม",
    "settings.swahili": "ภาษาสวาฮีลี",
  },
  sw: {
    "settings.swahili": "Kiswahili",
  },
};

export function setLanguage(language: Language) {
  currentLanguage = language;
  listeners.forEach((listener) => listener());
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function subscribeToLanguage(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function resolve(locale: unknown, keys: string[]) {
  let value = locale;
  for (const item of keys) {
    if (typeof value !== "object" || value === null) return undefined;
    value = (value as Record<string, unknown>)[item];
  }
  return typeof value === "string" ? value : undefined;
}

export function translate(key: string) {
  const keys = key.split(".");
  return resolve(languages[currentLanguage], keys)
    ?? supplementalTranslations[currentLanguage]?.[key]
    ?? resolve(en, keys)
    ?? supplementalTranslations.en?.[key]
    ?? key;
}
