import { unitRepository } from "../repositories/unit.repository";
import { unitSchema } from "../validators/unit.schema";

import type {
  Unit,
  CreateUnitDto,
  UpdateUnitDto,
} from "../types/unit.types";

import { UnitStatus } from "../types/unit.types";

function generateId(): string {
  return crypto.randomUUID();
}

export const unitService = {

  async getUnits(
    tenantId: string,
    storeId: string
  ): Promise<Unit[]> {
    return await unitRepository.findAll(
      tenantId,
      storeId
    );
  },

  async getUnitById(
    tenantId: string,
    id: string
  ): Promise<Unit | null> {
    return await unitRepository.findById(
      tenantId,
      id
    );
  },

  async createUnit(
    data: CreateUnitDto,
    tenantId: string,
    storeId: string
  ): Promise<Unit> {
    if (!tenantId || !storeId) {
      throw new Error("Tenant and store are required.");
    }

    const parsed = unitSchema.parse(data);

    const units = await unitRepository.findAll(
      tenantId,
      storeId
    );

    const duplicate = units.find(
      (unit) =>
        unit.name.trim().toLowerCase() ===
        parsed.name.trim().toLowerCase()
    );

    if (duplicate) {
      throw new Error("A unit with this name already exists.");
    }

    const symbolDuplicate = units.find(
      (unit) =>
        unit.symbol.trim().toLowerCase() ===
        parsed.symbol.trim().toLowerCase()
    );

    if (symbolDuplicate) {
      throw new Error("A unit with this symbol already exists.");
    }

    const now = new Date().toISOString();

    const unit: Unit = {
      id: generateId(),
      tenantId,
      storeId,
      name: parsed.name.trim(),
      symbol: parsed.symbol.trim(),
      description: parsed.description ?? null,
      status: UnitStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    return await unitRepository.create(unit);
  },

  async updateUnit(
    tenantId: string,
    storeId: string,
    id: string,
    updates: UpdateUnitDto
  ): Promise<Unit> {
    const existing = await unitRepository.findById(
      tenantId,
      id
    );

    if (!existing) {
      throw new Error("Unit not found.");
    }

    if (existing.storeId !== storeId) {
      throw new Error("Unit does not belong to the selected store.");
    }

    const parsed = unitSchema.partial().parse(updates);
    const parsedName = parsed.name;
    const parsedSymbol = parsed.symbol;

    const units = await unitRepository.findAll(
      tenantId,
      storeId
    );

    if (parsedName !== undefined) {
      const duplicate = units.find(
        (unit) =>
          unit.id !== id &&
          unit.name.trim().toLowerCase() ===
          parsedName.trim().toLowerCase()
      );

      if (duplicate) {
        throw new Error("A unit with this name already exists.");
      }
    }

    if (parsedSymbol !== undefined) {
      const duplicate = units.find(
        (unit) =>
          unit.id !== id &&
          unit.symbol.trim().toLowerCase() ===
          parsedSymbol.trim().toLowerCase()
      );

      if (duplicate) {
        throw new Error("A unit with this symbol already exists.");
      }
    }

    const updateData: Partial<Unit> = {};

    if (parsedName !== undefined) {
      updateData.name = parsedName.trim();
    }

    if (parsedSymbol !== undefined) {
      updateData.symbol = parsedSymbol.trim();
    }

    if (parsed.description !== undefined) {
      updateData.description = parsed.description ?? null;
    }

    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    return await unitRepository.update(
      tenantId,
      storeId,
      id,
      updateData
    );
  },

  async deleteUnit(
    tenantId: string,
    storeId: string,
    id: string
  ): Promise<void> {
    const existing = await unitRepository.findById(
      tenantId,
      id
    );

    if (!existing) {
      throw new Error("Unit not found.");
    }

    if (existing.storeId !== storeId) {
      throw new Error("Unit does not belong to the selected store.");
    }

    await unitRepository.delete(
      tenantId,
      storeId,
      id
    );
  },
};
