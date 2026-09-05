import { brandRepository } from "../repositories/brand.repository";
import { brandSchema } from "../validators/brand.schema";
import type {
  Brand,
  CreateBrandDto,
  UpdateBrandDto,
} from "../types/brand.types";
import { BrandStatus } from "../types/brand.types";

function generateId(): string {
  return crypto.randomUUID();
}

export const brandService = {

  async getBrands(
    tenantId: string,
    storeId: string
  ): Promise<Brand[]> {
    return await brandRepository.findAll(tenantId, storeId);
  },

  async getBrandById(
    tenantId: string,
    id: string
  ): Promise<Brand | null> {
    return await brandRepository.findById(tenantId, id);
  },

  async getActiveBrands(
    tenantId: string,
    storeId: string
  ): Promise<Brand[]> {
    const brands = await brandRepository.findAll(tenantId, storeId);

    return brands.filter(
      (brand) => brand.status === BrandStatus.ACTIVE
    );
  },

  async getBrandStats(
    tenantId: string,
    storeId: string
  ): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const brands = await brandRepository.findAll(tenantId, storeId);

    return {
      total: brands.length,
      active: brands.filter(
        (brand) => brand.status === BrandStatus.ACTIVE
      ).length,
      inactive: brands.filter(
        (brand) => brand.status === BrandStatus.INACTIVE
      ).length,
    };
  },

  async createBrand(
    data: CreateBrandDto,
    tenantId: string,
    storeId: string
  ): Promise<Brand> {
    if (!tenantId || !storeId) {
      throw new Error("Tenant and store are required.");
    }

    const parsed = brandSchema.parse(data);

    const brands = await brandRepository.findAll(
      tenantId,
      storeId
    );

    const duplicateName = brands.find(
      (brand) =>
        brand.name.trim().toLowerCase() ===
        parsed.name.trim().toLowerCase()
    );

    if (duplicateName) {
      throw new Error("A brand with this name already exists.");
    }

    if (parsed.code) {
      const duplicateCode = await brandRepository.existsByCode(
        tenantId,
        storeId,
        parsed.code
      );

      if (duplicateCode) {
        throw new Error("A brand with this code already exists.");
      }
    }

    const now = new Date().toISOString();

    const brand: Brand = {
      id: generateId(),
      tenantId,
      storeId,
      name: parsed.name.trim(),
      code: parsed.code ?? null,
      description: parsed.description ?? null,
      logoUrl: parsed.logoUrl ?? null,
      status: BrandStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    return await brandRepository.create(brand);
  },

  async updateBrand(
    tenantId: string,
    storeId: string,
    id: string,
    updates: UpdateBrandDto
  ): Promise<Brand> {
    if (!tenantId || !storeId) {
      throw new Error("Tenant and store are required.");
    }

    const existing = await brandRepository.findById(
      tenantId,
      id
    );

    if (!existing) {
      throw new Error("Brand not found.");
    }

    if (existing.storeId !== storeId) {
      throw new Error("Brand does not belong to the selected store.");
    }

    const parsed = brandSchema.partial().parse(updates);
    const parsedName = parsed.name;

    const brands = await brandRepository.findAll(
      tenantId,
      storeId
    );

    if (parsedName !== undefined) {
      const duplicateName = brands.find(
        (brand) =>
          brand.id !== id &&
          brand.name.trim().toLowerCase() ===
          parsedName.trim().toLowerCase()
      );

      if (duplicateName) {
        throw new Error("A brand with this name already exists.");
      }
    }

    if (parsed.code) {
      const duplicateCode = await brandRepository.existsByCode(
        tenantId,
        storeId,
        parsed.code,
        id
      );

      if (duplicateCode) {
        throw new Error("A brand with this code already exists.");
      }
    }

    const updateData: Partial<Brand> = {};

    if (parsedName !== undefined) {
      updateData.name = parsedName.trim();
    }

    if (parsed.code !== undefined) {
      updateData.code = parsed.code ?? null;
    }

    if (parsed.description !== undefined) {
      updateData.description = parsed.description ?? null;
    }

    if (parsed.logoUrl !== undefined) {
      updateData.logoUrl = parsed.logoUrl ?? null;
    }

    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    return await brandRepository.update(
      tenantId,
      storeId,
      id,
      updateData
    );
  },

  async toggleStatus(
    tenantId: string,
    storeId: string,
    id: string
  ): Promise<Brand> {
    const existing = await brandRepository.findById(
      tenantId,
      id
    );

    if (!existing) {
      throw new Error("Brand not found.");
    }

    const status =
      existing.status === BrandStatus.ACTIVE
        ? BrandStatus.INACTIVE
        : BrandStatus.ACTIVE;

    return await brandRepository.update(
      tenantId,
      storeId,
      id,
      { status }
    );
  },

  async deleteBrand(
    tenantId: string,
    storeId: string,
    id: string
  ): Promise<void> {
    const existing = await brandRepository.findById(
      tenantId,
      id
    );

    if (!existing) {
      throw new Error("Brand not found.");
    }

    if (existing.storeId !== storeId) {
      throw new Error("Brand does not belong to the selected store.");
    }

    await brandRepository.delete(
      tenantId,
      storeId,
      id
    );
  },
};
