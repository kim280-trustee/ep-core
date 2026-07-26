import type {
  ProductFormInput,
} from "../../../features/products/validators/product.schema";

export const sampleProducts: ProductFormInput[] = [

  {
    name: "Coca-Cola 500ml",
    description: "Soft drink",
    productType: "simple",

    sku: "CC500",

    barcode: "8851959132010",

    categoryId: "",

    brandId: "",

    unitId: "",

    costPrice: 15,

    sellingPrice: 20,

    wholesalePrice: 18,

    currency: "THB",

    trackInventory: true,

    stockQuantity: 100,

    minimumStockLevel: 10,

    maximumStockLevel: 500,

    taxable: true,

    taxRate: 7,

    imageUrl: "",

  },

];