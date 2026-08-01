/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Seed Service
 * ============================================================
 */


import {
  productService,
} from "../../../features/products/services/product.service";


import {
  inventoryService,
} from "../../../features/inventory/services/inventory.service";


import {
  categoryService,
} from "../../../features/categories/services/category.service";


import {
  brandService,
} from "../../../features/brands/services/brand.service";


import {
  unitService,
} from "../../../features/units/services/unit.service";


import {
  customerService,
} from "../../../features/customers/services/customer.service";


import {
  supplierService,
} from "../../../features/suppliers/services/supplier.service";


import {
  warehouseService,
} from "../../../features/warehouses/services/warehouse.service";


import {
  taxService,
} from "../../../features/taxes/services/tax.service";


import {
  paymentMethodService,
} from "../../../features/payment-methods/services/payment-method.service";



import {
  DEFAULT_SEED,
} from "./seed.constants";


import type {
  SeedOptions,
} from "./seed.types";



import {
  sampleCategories,
} from "../sample-data/categories";


import {
  sampleBrands,
} from "../sample-data/brands";


import {
  sampleUnits,
} from "../sample-data/units";


import {
  sampleProducts,
} from "../sample-data/products";


import {
  sampleInventory,
} from "../sample-data/inventory";


import {
  sampleCustomers,
} from "../sample-data/customers";


import {
  sampleSuppliers,
} from "../sample-data/suppliers";


import {
  sampleWarehouses,
} from "../sample-data/warehouses";


import {
  sampleTaxes,
} from "../sample-data/taxes";


import {
  samplePaymentMethods,
} from "../sample-data/payment-methods";



class SeedService {



  seed(

    options:Partial<SeedOptions> = {},

  ){



    const config = {


      ...DEFAULT_SEED,


      ...options,


    };




    sampleCategories.forEach(

      category => {


        categoryService.createCategory(

          category,

          config.tenantId,

          config.storeId,

        );


      },

    );




    sampleBrands.forEach(

      brand => {


        brandService.createBrand(

          brand,

          config.tenantId,

          config.storeId,

        );


      },

    );




    sampleUnits.forEach(

      unit => {


        unitService.createUnit(

          unit,

          config.tenantId,

          config.storeId,

        );


      },

    );




    sampleWarehouses.forEach(

      warehouse => {


        warehouseService.createWarehouse(

          config.tenantId,

          config.storeId,

          warehouse,

        );


      },

    );




    sampleCustomers.forEach(

      customer => {


        customerService.createCustomer(

          customer,

          config.tenantId,

          config.storeId,

        );


      },

    );




    sampleSuppliers.forEach(

      supplier => {


        supplierService.createSupplier(

          config.tenantId,

          config.storeId,

          supplier,

        );


      },

    );




    sampleTaxes.forEach(

      tax => {


        taxService.createTax(

          config.tenantId,

          config.storeId,

          tax,

        );


      },

    );




    samplePaymentMethods.forEach(

      method => {


        paymentMethodService.createPaymentMethod(

          config.tenantId,

          config.storeId,

          method,

        );


      },

    );




    sampleProducts.forEach(

      product => {



        productService.createProduct(

          config.tenantId,

          config.storeId,

          {


            name:

              product.name,



            description:

              product.description ?? null,



            identifiers: {


              sku:

                product.sku,



              barcode:

                product.barcode ?? null,


            },



            pricing: {


              costPrice:

                product.costPrice,



              sellingPrice:

                product.sellingPrice,



              currency:

                product.currency,


            },



            tax: {


              taxId:

                null,



              taxRate:

                0,


            },



            inventory: {


              trackInventory:

                product.trackInventory,



              stockQuantity:

                product.stockQuantity,


            },



            categoryId:

              product.categoryId ?? null,



            brandId:

              product.brandId ?? null,



            unitId:

              product.unitId ?? null,



            imageUrl:

              product.imageUrl ?? null,


          },

        );


      },

    );




    sampleInventory.forEach(

      record => {


        inventoryService.createInventoryRecord(

          record,

        );


      },

    );



  }



}



export const seedService =

  new SeedService();