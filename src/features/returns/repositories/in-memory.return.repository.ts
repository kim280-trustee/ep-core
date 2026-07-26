import type { Return } from "../types";
import type { ReturnRepository } from "./return.repository";

class InMemoryReturnRepository implements ReturnRepository {
  private returns: Return[] = [];

  findAll(): Return[] {
    return this.returns;
  }

  findById(
    id: string,
  ): Return | undefined {
    return this.returns.find(
      (value) => value.id === id,
    );
  }

  findBySaleId(
    saleId: string,
  ): Return[] {
    return this.returns.filter(
      (value) => value.saleId === saleId,
    );
  }

  create(
    value: Return,
  ): Return {
    this.returns.push(value);

    return value;
  }

  update(
    id: string,
    updates: Partial<Return>,
  ): Return | undefined {
    const index = this.returns.findIndex(
      (value) => value.id === id,
    );

    if (index === -1) {
      return undefined;
    }

    this.returns[index] = {
      ...this.returns[index],
      ...updates,
    };

    return this.returns[index];
  }
}

export const inMemoryReturnRepository =
  new InMemoryReturnRepository();