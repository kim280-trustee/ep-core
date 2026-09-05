/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * In Memory Brand Repository
 * ============================================================
 */

import {
  BrandStatus,
} from "../types/brand.types";

import type {
  Brand,
  CreateBrandDto,
  UpdateBrandDto,
} from "../types/brand.types";

export class InMemoryBrandRepository {

  private brands: Brand[] = [];

  findAll(): Brand[] {
    return this.brands;
  }

  findById(
    id: string,
  ): Brand | undefined {
    return this.brands.find(
      (brand) =>
        brand.id === id,
    );
  }

  findByCode(
    code: string,
  ): Brand | undefined {
    return this.brands.find(
      (brand) =>
        brand.code === code,
    );
  }

  existsByCode(
    code: string,
  ): boolean {
    return this.brands.some(
      (brand) =>
        brand.code === code,
    );
  }

  create(
    tenantId: string,
    storeId: string,
    data: CreateBrandDto,
  ): Brand {

    const now =
      new Date().toISOString();

    const brand: Brand = {
      id: crypto.randomUUID(),
      tenantId,
      storeId,
      name: data.name,
      code: data.code ?? null,
      description:
        data.description ?? null,
      logoUrl:
        data.logoUrl ?? null,
      status:
        BrandStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    this.brands.push(brand);

    return brand;
  }

  update(
    id: string,
    updates: UpdateBrandDto,
  ): Brand | undefined {

    const brand =
      this.findById(id);

    if (!brand) {
      return undefined;
    }

    Object.assign(
      brand,
      updates,
      {
        updatedAt:
          new Date().toISOString(),
      },
    );

    return brand;
  }

  delete(
    id: string,
  ): boolean {

    const index =
      this.brands.findIndex(
        (brand) =>
          brand.id === id,
      );

    if (index === -1) {
      return false;
    }

    this.brands.splice(
      index,
      1,
    );

    return true;
  }
}
