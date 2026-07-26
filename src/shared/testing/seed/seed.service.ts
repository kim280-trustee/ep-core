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
    options: Partial<SeedOptions> = {},
  ) {


    const config = {

      ...DEFAULT_SEED,

      ...options,

    };



    sampleCategories.forEach(

      (category) => {

        categoryService.createCategory(

          category,

          config.tenantId,

          config.storeId,

        );

      },

    );



    sampleBrands.forEach(

      (brand) => {

        brandService.createBrand(

          brand,

          config.tenantId,

          config.storeId,

        );

      },

    );



    sampleUnits.forEach(

      (unit) => {

        unitService.createUnit(

          unit,

          config.tenantId,

          config.storeId,

        );

      },

    );



    sampleWarehouses.forEach(

      (warehouse) => {

        warehouseService.createWarehouse(

          warehouse,

          config.tenantId,

          config.storeId,

        );

      },

    );



    sampleCustomers.forEach(

      (customer) => {

        customerService.createCustomer(

          customer,

          config.tenantId,

          config.storeId,

        );

      },

    );



    sampleSuppliers.forEach(

      (supplier) => {

        supplierService.createSupplier(

          supplier,

          config.tenantId,

          config.storeId,

        );

      },

    );



    sampleTaxes.forEach(

      (tax) => {

        taxService.createTax(

          tax,

          config.tenantId,

          config.storeId,

        );

      },

    );



    samplePaymentMethods.forEach(

      (method) => {

        paymentMethodService.createPaymentMethod(

          method,

          config.tenantId,

          config.storeId,

        );

      },

    );



    sampleProducts.forEach(

      (product) => {

        productService.createProduct(

          product,

          config.tenantId,

          config.storeId,

        );

      },

    );



    sampleInventory.forEach(

      (record) => {

        inventoryService.createInventoryRecord(

          record,

        );

      },

    );


  }


}



export const seedService =
  new SeedService();