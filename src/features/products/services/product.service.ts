import {
  productRepository,
} from "../repositories";

import type {
  Product,
} from "../types/product.types";


import type {
  ProductFormInput,
} from "../validators/product.schema";


class ProductService {


  generateId(): string {
    return crypto.randomUUID();
  }


  generateSKU(): string {

    return `SKU-${Date.now()}`;
  }



  getProducts(): Product[] {

    return productRepository.findAll();

  }



  getProductById(
    id: string,
  ): Product | undefined {

    return productRepository.findById(id);

  }



  createProduct(
    input: ProductFormInput,
    tenantId: string,
    storeId: string,
  ): Product {


    const now = new Date().toISOString();


    const product: Product = {

      id: this.generateId(),

      tenantId,

      storeId,

      name: input.name,

      description: input.description,

      productType: input.productType,

      identifiers: {
        sku: input.sku || this.generateSKU(),
        barcode: input.barcode,
      },


      categoryId: input.categoryId,

      brandId: input.brandId,

      unitId: input.unitId,


      pricing: {

        costPrice: input.costPrice,

        sellingPrice: input.sellingPrice,

        wholesalePrice: input.wholesalePrice,

        currency: input.currency,

      },


      inventory: {

        trackInventory: input.trackInventory,

        stockQuantity: input.stockQuantity,

        minimumStockLevel:
          input.minimumStockLevel,

        maximumStockLevel:
          input.maximumStockLevel,

      },


      tax: {

        taxable: input.taxable,

        taxRate: input.taxRate,

      },


      imageUrl: input.imageUrl,


      status: "active",


      createdAt: now,

      updatedAt: now,

    };


    return productRepository.create(product);

  }



  updateProduct(
    id: string,
    updates: Partial<Product>,
  ): Product | undefined {

    return productRepository.update(
      id,
      updates,
    );

  }



  deleteProduct(
    id: string,
  ): boolean {

    return productRepository.delete(id);

  }

}


export const productService =
  new ProductService();