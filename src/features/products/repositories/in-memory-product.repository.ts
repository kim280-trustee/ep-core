import type {
  CreateProductInput,
  Product,
  ProductListParams,
  ProductListResult,
  UpdateProductInput,
} from "../types/product.types";

import {
  ProductStatus,
  ProductType,
} from "../types/product.types";

import type {
  IProductRepository,
} from "./product.repository";


class InMemoryProductRepository
  implements IProductRepository {


  private products: Product[] = [];



  async findAll(
    tenantId: string,
    params: ProductListParams = {},
  ): Promise<ProductListResult> {

    const page =
      params.page ?? 1;

    const limit =
      params.limit ?? 20;


    const filtered =
      this.products.filter(
        product =>
          product.tenantId === tenantId,
      );


    const start =
      (page - 1) * limit;


    return {
      data:
        filtered.slice(
          start,
          start + limit,
        ),

      total:
        filtered.length,

      page,

      limit,
    };
  }



  async findById(
    tenantId: string,
    id: string,
  ): Promise<Product | null> {


    return (
      this.products.find(
        product =>
          product.tenantId === tenantId &&
          product.id === id,
      )
      ?? null
    );

  }




  async create(
    input: CreateProductInput,
  ): Promise<Product> {


    const now =
      new Date()
        .toISOString();


    const product: Product = {


      id:
        crypto.randomUUID(),


      tenantId:
        input.tenantId,


      storeId:
        input.storeId,


      name:
        input.name,


      sku:
        input.sku,


      barcode:
        input.barcode,


      identifiers:{
        sku:
          input.sku,

        barcode:
          input.barcode,
      },


      pricing:{
        costPrice:
          input.costPrice,

        sellingPrice:
          input.sellingPrice,

        currency:
          input.currency ?? "THB",
      },


      tax:{},


      inventory:{
        stockQuantity:0,
      },


      productType:
        input.productType
        ??
        ProductType.PRODUCT,


      type:
        input.productType
        ??
        ProductType.PRODUCT,


      status:
        input.status
        ??
        ProductStatus.ACTIVE,


      costPrice:
        input.costPrice,


      sellingPrice:
        input.sellingPrice,


      trackInventory:
        input.trackInventory
        ??
        true,


      description:
        input.description,


      categoryId:
        input.categoryId,


      brandId:
        input.brandId,


      unitId:
        input.unitId,


      taxId:
        input.taxId,


      imageUrl:
        input.imageUrl,


      createdAt:
        now,


      updatedAt:
        now,

    };


    this.products.push(product);


    return product;

  }





  async update(
    tenantId:string,
    id:string,
    input:UpdateProductInput,
  ):Promise<Product>{


    const index =
      this.products.findIndex(
        product =>
          product.tenantId === tenantId &&
          product.id === id,
      );


    if(index === -1){

      throw new Error(
        "Product not found",
      );

    }


    const updated:Product={

      ...this.products[index],

      ...input,


      updatedAt:
        new Date()
        .toISOString(),

    };


    this.products[index]=updated;


    return updated;

  }




  async delete(
    tenantId:string,
    id:string,
  ):Promise<void>{


    this.products =
      this.products.filter(
        product =>
          !(
            product.tenantId===tenantId &&
            product.id===id
          ),
      );

  }





  async search(
    tenantId:string,
    search:string,
  ):Promise<Product[]>{


    const value =
      search.toLowerCase();


    return this.products.filter(
      product =>
        product.tenantId===tenantId &&
        product.name
        .toLowerCase()
        .includes(value),
    );

  }

}


export const inMemoryProductRepository =
  new InMemoryProductRepository();