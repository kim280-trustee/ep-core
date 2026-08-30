import type {
  Sale,
} from "../types/sale.types";

import type {
  SaleRepository,
} from "./sale.repository";

class InMemorySaleRepository
  implements SaleRepository
{
  private sales: Sale[] = [];

  findAll(): Sale[] {
    return this.sales.map(
      (sale) => ({
        ...sale,
        items: sale.items.map(
          (item) => ({ ...item }),
        ),
      }),
    );
  }

  findById(
    id: string,
  ): Sale | undefined {
    const sale =
      this.sales.find(
        (item) =>
          item.id === id,
      );

    if (!sale) {
      return undefined;
    }

    return {
      ...sale,
      items: sale.items.map(
        (item) => ({ ...item }),
      ),
    };
  }

  create(
    sale: Sale,
  ): Sale {
    if (
      this.sales.some(
        (item) =>
          item.id === sale.id,
      )
    ) {
      throw new Error(
        `Sale already exists: ${sale.id}`,
      );
    }

    const stored: Sale = {
      ...sale,
      items: sale.items.map(
        (item) => ({ ...item }),
      ),
    };

    this.sales.push(stored);

    return {
      ...stored,
      items: stored.items.map(
        (item) => ({ ...item }),
      ),
    };
  }

  update(
    id: string,
    updates: Partial<Sale>,
  ): Sale | undefined {
    const index =
      this.sales.findIndex(
        (sale) =>
          sale.id === id,
      );

    if (index < 0) {
      return undefined;
    }

    const current =
      this.sales[index];

    const updated: Sale = {
      ...current,
      ...updates,
      id: current.id,
      tenantId:
        current.tenantId,
      items:
        updates.items !== undefined
          ? updates.items.map(
              (item) => ({ ...item }),
            )
          : current.items.map(
              (item) => ({ ...item }),
            ),
      updatedAt:
        new Date().toISOString(),
    };

    this.sales[index] = updated;

    return {
      ...updated,
      items: updated.items.map(
        (item) => ({ ...item }),
      ),
    };
  }
}

export const inMemorySaleRepository =
  new InMemorySaleRepository();
