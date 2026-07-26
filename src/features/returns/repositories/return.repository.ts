import type { Return } from "../types";

export interface ReturnRepository {
  findAll(): Return[];

  findById(
    id: string,
  ): Return | undefined;

  findBySaleId(
    saleId: string,
  ): Return[];

  create(
    value: Return,
  ): Return;

  update(
    id: string,
    updates: Partial<Return>,
  ): Return | undefined;
}