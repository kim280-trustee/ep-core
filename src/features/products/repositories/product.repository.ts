/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Products Module
 * ------------------------------------------------------------
 * Product Repository Contract
 * ============================================================
 */


import type {

  Product,

  CreateProductDto,

  UpdateProductDto,

} from "../types/product.types";





export interface IProductRepository {



  findAll(): Product[];





  findById(

    id:string,

  ): Product | undefined;





  findBySku(

    sku:string,

  ): Product | undefined;





  findByBarcode(

    barcode:string,

  ): Product | undefined;





  existsBySku(

    sku:string,

  ): boolean;





  existsByBarcode(

    barcode:string,

  ): boolean;





  create(

    tenantId:string,

    storeId:string,

    data:CreateProductDto,

  ): Product;





  update(

    id:string,

    updates:UpdateProductDto,

  ): Product | undefined;





  delete(

    id:string,

  ): boolean;



}