import type {
  Sale,
} from "../types/sale.types";

export interface SaleRepository {
  findAll(): Sale[];

  findById(
    id: string,
  ): Sale | undefined;

  create(
    sale: Sale,
  ): Sale;

  update(
    id: string,
    updates: Partial<Sale>,
  ): Sale | undefined;
}
