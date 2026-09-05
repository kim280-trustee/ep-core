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

  async seed(
    options: Partial<SeedOptions> = {},
  ) {

    const config = {
      ...DEFAULT_SEED,
      ...options,
    };

    for (const category of sampleCategories) {

      await categoryService.createCategory(
        category,
        config.tenantId,
        config.storeId,
      );

    }

    for (const brand of sampleBrands) {

      await brandService.createBrand(
        brand,
        config.tenantId,
        config.storeId,
      );

    }

    for (const unit of sampleUnits) {

      await unitService.createUnit(
        unit,
        config.tenantId,
        config.storeId,
      );

    }

    for (const warehouse of sampleWarehouses) {

      await warehouseService.createWarehouse(
        config.tenantId,
        config.storeId,
        warehouse,
      );

    }

    for (const customer of sampleCustomers) {

      await customerService.createCustomer(
        customer,
        config.tenantId,
        config.storeId,
      );

    }

    for (const supplier of sampleSuppliers) {

      await supplierService.createSupplier(
        supplier,
        config.tenantId,
        config.storeId,
      );

    }

    for (const tax of sampleTaxes) {

      await taxService.createTax(
        config.tenantId,
        config.storeId,
        tax,
      );

    }

    for (
      const method of samplePaymentMethods
    ) {

      await paymentMethodService
        .createPaymentMethod(
          config.tenantId,
          config.storeId,
          method,
        );

    }

    for (const product of sampleProducts) {

      await productService.createProduct({

        tenantId:
          config.tenantId,

        storeId:
          config.storeId,

        name:
          product.name,

        sku:
          product.sku,

        barcode:
          product.barcode ??
          undefined,

        description:
          product.description ??
          undefined,

        costPrice:
          product.costPrice,

        sellingPrice:
          product.sellingPrice,

        currency:
          product.currency ??
          "THB",

        trackInventory:
          product.trackInventory,

        categoryId:
          product.categoryId ??
          undefined,

        brandId:
          product.brandId ??
          undefined,

        unitId:
          product.unitId ??
          undefined,

        imageUrl:
          product.imageUrl ??
          undefined,

      });

    }

    for (const record of sampleInventory) {

      await inventoryService.createInventoryRecord(
        record,
      );

    }
  }
}

export const seedService =
  new SeedService();
