import { create } from "zustand";

import { brandService } from "../services/brand.service";

import type {
  Brand,
  CreateBrandDto,
  UpdateBrandDto,
} from "../types/brand.types";

interface BrandsStore {
  brands: Brand[];
  search: string;

  loadBrands(
    tenantId: string,
    storeId: string
  ): Promise<void>;

  createBrand(
    input: CreateBrandDto,
    tenantId: string,
    storeId: string
  ): Promise<void>;

  updateBrand(
    tenantId: string,
    storeId: string,
    id: string,
    updates: UpdateBrandDto
  ): Promise<void>;

  deleteBrand(
    tenantId: string,
    storeId: string,
    id: string
  ): Promise<void>;

  setSearch(value: string): void;
}

export const useBrandsStore = create<BrandsStore>((set) => ({

  brands: [],

  search: "",

  async loadBrands(tenantId, storeId) {
    const brands = await brandService.getBrands(
      tenantId,
      storeId
    );

    set({ brands });
  },

  async createBrand(input, tenantId, storeId) {
    await brandService.createBrand(
      input,
      tenantId,
      storeId
    );

    const brands = await brandService.getBrands(
      tenantId,
      storeId
    );

    set({ brands });
  },

  async updateBrand(tenantId, storeId, id, updates) {
    await brandService.updateBrand(
      tenantId,
      storeId,
      id,
      updates
    );

    const brands = await brandService.getBrands(
      tenantId,
      storeId
    );

    set({ brands });
  },

  async deleteBrand(tenantId, storeId, id) {
    await brandService.deleteBrand(
      tenantId,
      storeId,
      id
    );

    const brands = await brandService.getBrands(
      tenantId,
      storeId
    );

    set({ brands });
  },

  setSearch(value) {
    set({ search: value });
  },

}));
