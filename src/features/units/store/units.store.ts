import { create } from "zustand";

import { unitService } from "../services/unit.service";

import type {
  Unit,
  CreateUnitDto,
  UpdateUnitDto,
} from "../types/unit.types";

interface UnitsStore {
  units: Unit[];
  search: string;

  loadUnits(
    tenantId: string,
    storeId: string
  ): Promise<void>;

  createUnit(
    input: CreateUnitDto,
    tenantId: string,
    storeId: string
  ): Promise<void>;

  updateUnit(
    tenantId: string,
    storeId: string,
    id: string,
    updates: UpdateUnitDto
  ): Promise<void>;

  deleteUnit(
    tenantId: string,
    storeId: string,
    id: string
  ): Promise<void>;

  setSearch(value: string): void;
}

export const useUnitsStore =
  create<UnitsStore>((set) => ({

    units: [],

    search: "",

    async loadUnits(tenantId, storeId) {
      const units =
        await unitService.getUnits(
          tenantId,
          storeId
        );

      set({ units });
    },

    async createUnit(input, tenantId, storeId) {
      await unitService.createUnit(
        input,
        tenantId,
        storeId
      );

      const units =
        await unitService.getUnits(
          tenantId,
          storeId
        );

      set({ units });
    },

    async updateUnit(
      tenantId,
      storeId,
      id,
      updates
    ) {
      await unitService.updateUnit(
        tenantId,
        storeId,
        id,
        updates
      );

      const units =
        await unitService.getUnits(
          tenantId,
          storeId
        );

      set({ units });
    },

    async deleteUnit(
      tenantId,
      storeId,
      id
    ) {
      await unitService.deleteUnit(
        tenantId,
        storeId,
        id
      );

      const units =
        await unitService.getUnits(
          tenantId,
          storeId
        );

      set({ units });
    },

    setSearch(value) {
      set({ search: value });
    },

  }));
