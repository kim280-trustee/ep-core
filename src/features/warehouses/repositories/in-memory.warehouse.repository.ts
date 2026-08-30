import {
  v4 as uuid,
} from "uuid";


import type {
  Warehouse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from "../types/warehouse.types";


import type {
  WarehouseRepository,
} from "./warehouse.repository";


class InMemoryWarehouseRepository
implements WarehouseRepository {


  private warehouses: Warehouse[] = [];


  async findAll(): Promise<Warehouse[]> {

    return this.warehouses;

  }


  async findById(
    id: string,
  ): Promise<Warehouse | undefined> {

    return this.warehouses.find(
      (item) =>
        item.id === id,
    );

  }


  async create(
    warehouse:
      CreateWarehouseDto & {
        tenantId: string;
        storeId: string;
      },
  ): Promise<Warehouse> {

    const item: Warehouse = {

      id:
        uuid(),

      ...warehouse,

      status:
        "ACTIVE",

      createdAt:
        new Date(),

      updatedAt:
        new Date(),

    };


    this.warehouses.push(
      item,
    );


    return item;

  }


  async update(
    id: string,
    warehouse: UpdateWarehouseDto,
  ): Promise<Warehouse | undefined> {

    const existing =
      await this.findById(
        id,
      );


    if (!existing) {

      return undefined;

    }


    Object.assign(
      existing,
      warehouse,
      {
        updatedAt:
          new Date(),
      },
    );


    return existing;

  }


  async delete(
    id: string,
  ): Promise<boolean> {

    const index =
      this.warehouses.findIndex(
        (item) =>
          item.id === id,
      );


    if (
      index === -1
    ) {

      return false;

    }


    this.warehouses.splice(
      index,
      1,
    );


    return true;

  }

}


export const inMemoryWarehouseRepository =
  new InMemoryWarehouseRepository();
