/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * In Memory Product Repository
 * ============================================================
 */


import {
  v4 as uuid,
} from "uuid";


import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
} from "../types/product.types";


import {
  ProductStatus,
  ProductType,
} from "../types/product.types";


import type {
  IProductRepository,
} from "./product.repository";



export class InMemoryProductRepository

implements IProductRepository {



  private readonly products =

    new Map<string, Product>();




  findAll(): Product[] {


    return Array.from(

      this.products.values(),

    );


  }




  findById(

    id:string,

  ):Product | undefined {


    return this.products.get(

      id,

    );


  }




  findBySku(

    sku:string,

  ):Product | undefined {


    return this.findAll().find(

      product =>

        product.identifiers.sku === sku,

    );


  }




  findByBarcode(

    barcode:string,

  ):Product | undefined {


    return this.findAll().find(

      product =>

        product.identifiers.barcode === barcode,

    );


  }




  existsBySku(

    sku:string,

  ):boolean {


    return (

      this.findBySku(sku)

      !== undefined

    );


  }




  existsByBarcode(

    barcode:string,

  ):boolean {


    return (

      this.findByBarcode(barcode)

      !== undefined

    );


  }




  create(

    tenantId:string,

    storeId:string,

    data:CreateProductDto,

  ):Product {



    const now =

      new Date().toISOString();




    const product:Product = {



      id:

        uuid(),



      tenantId,



      storeId,



      name:

        data.name,



      description:

        data.description ?? null,



      type:

        data.type ?? ProductType.PRODUCT,



      identifiers: {

        sku:

          data.identifiers.sku,


        barcode:

          data.identifiers.barcode ?? null,

      },



      pricing: {

        costPrice:

          data.pricing.costPrice,


        sellingPrice:

          data.pricing.sellingPrice,


        currency:

          data.pricing.currency,

      },



      tax:

        data.tax ?? {

          taxId:null,

          taxRate:0,

        },



      inventory:

        data.inventory ?? {

          trackInventory:true,

          stockQuantity:0,

        },



      categoryId:

        data.categoryId ?? null,



      brandId:

        data.brandId ?? null,



      unitId:

        data.unitId ?? null,



      imageUrl:

        data.imageUrl ?? null,



      status:

        ProductStatus.ACTIVE,



      createdAt:

        now,



      updatedAt:

        now,


    };



    this.products.set(

      product.id,

      product,

    );



    return product;


  }






  update(

    id:string,

    updates:UpdateProductDto,

  ):Product | undefined {



    const existing =

      this.products.get(id);



    if(!existing){

      return undefined;

    }




    const updated:Product = {



      ...existing,



      ...updates,



      identifiers: {

        ...existing.identifiers,

        ...updates.identifiers,

      },



      pricing: {

        ...existing.pricing,

        ...updates.pricing,

      },



      tax: {

        ...existing.tax,

        ...updates.tax,

      },



      inventory: {

        ...existing.inventory,

        ...updates.inventory,

      },



      updatedAt:

        new Date().toISOString(),


    };



    this.products.set(

      id,

      updated,

    );



    return updated;


  }






  delete(

    id:string,

  ):boolean {


    return this.products.delete(

      id,

    );


  }


}