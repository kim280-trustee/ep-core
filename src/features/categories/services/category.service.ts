import { categoryRepository } from "../repositories/category.repository";
import { categorySchema } from "../validators/category.schema";

import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types/category.types";

import { CategoryStatus } from "../types/category.types";

function generateId(): string {
  return crypto.randomUUID();
}

export const categoryService = {

  async getCategories(
    tenantId: string,
    storeId: string
  ): Promise<Category[]> {
    return await categoryRepository.findAll(
      tenantId,
      storeId
    );
  },

  async getCategoryById(
    tenantId: string,
    id: string
  ): Promise<Category | null> {
    return await categoryRepository.findById(
      tenantId,
      id
    );
  },

  async createCategory(
    data: CreateCategoryDto,
    tenantId: string,
    storeId: string
  ): Promise<Category> {
    if (!tenantId || !storeId) {
      throw new Error("Tenant and store are required.");
    }

    const parsed = categorySchema.parse(data);

    const categories = await categoryRepository.findAll(
      tenantId,
      storeId
    );

    const duplicate = categories.find(
      (category) =>
        category.name.trim().toLowerCase() ===
        parsed.name.trim().toLowerCase()
    );

    if (duplicate) {
      throw new Error("A category with this name already exists.");
    }

    const now = new Date().toISOString();

    const category: Category = {
      id: generateId(),
      tenantId,
      storeId,
      name: parsed.name.trim(),
      description: parsed.description ?? null,
      parentId: parsed.parentId ?? null,
      status: CategoryStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    return await categoryRepository.create(category);
  },

  async updateCategory(
    tenantId: string,
    storeId: string,
    id: string,
    updates: UpdateCategoryDto
  ): Promise<Category> {
    const existing = await categoryRepository.findById(
      tenantId,
      id
    );

    if (!existing) {
      throw new Error("Category not found.");
    }

    if (existing.storeId !== storeId) {
      throw new Error("Category does not belong to the selected store.");
    }

    const parsed = categorySchema.partial().parse(updates);
    const parsedName = parsed.name;

    const categories = await categoryRepository.findAll(
      tenantId,
      storeId
    );

    if (parsedName !== undefined) {
      const duplicate = categories.find(
        (category) =>
          category.id !== id &&
          category.name.trim().toLowerCase() ===
          parsedName.trim().toLowerCase()
      );

      if (duplicate) {
        throw new Error("A category with this name already exists.");
      }
    }

    const updateData: Partial<Category> = {};

    if (parsedName !== undefined) {
      updateData.name = parsedName.trim();
    }

    if (parsed.description !== undefined) {
      updateData.description = parsed.description ?? null;
    }

    if (parsed.parentId !== undefined) {
      updateData.parentId = parsed.parentId ?? null;
    }

    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    return await categoryRepository.update(
      tenantId,
      storeId,
      id,
      updateData
    );
  },

  async deleteCategory(
    tenantId: string,
    storeId: string,
    id: string
  ): Promise<void> {
    const existing = await categoryRepository.findById(
      tenantId,
      id
    );

    if (!existing) {
      throw new Error("Category not found.");
    }

    if (existing.storeId !== storeId) {
      throw new Error("Category does not belong to the selected store.");
    }

    await categoryRepository.delete(
      tenantId,
      storeId,
      id
    );
  },
};
