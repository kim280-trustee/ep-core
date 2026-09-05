import type {
  Unit,
} from "../types/unit.types";

class InMemoryUnitRepository {

  private units: Unit[] = [];

  findAll(): Unit[] {
    return [
      ...this.units,
    ];
  }

  findById(
    id: string,
  ): Unit | undefined {
    return this.units.find(
      (unit) =>
        unit.id === id,
    );
  }

  create(
    unit: Unit,
  ): Unit {
    this.units.push(unit);
    return unit;
  }

  update(
    id: string,
    updates: Partial<Unit>,
  ): Unit | undefined {

    const index =
      this.units.findIndex(
        (unit) =>
          unit.id === id,
      );

    if (index === -1) {
      return undefined;
    }

    const existing =
      this.units[index];

    if (!existing) {
      return undefined;
    }

    const updated: Unit = {
      ...existing,
      ...updates,
      updatedAt:
        new Date().toISOString(),
    };

    this.units[index] =
      updated;

    return updated;
  }

  delete(
    id: string,
  ): boolean {

    const index =
      this.units.findIndex(
        (unit) =>
          unit.id === id,
      );

    if (index === -1) {
      return false;
    }

    this.units.splice(
      index,
      1,
    );

    return true;
  }
}

export const inMemoryUnitRepository =
  new InMemoryUnitRepository();
