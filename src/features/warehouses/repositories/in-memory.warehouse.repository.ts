import type {
  Warehouse,
} from "../types/warehouse.types";


import type {
  IWarehouseRepository,
} from "./warehouse.repository";



class InMemoryWarehouseRepository
  implements IWarehouseRepository {



  private warehouses: Warehouse[] = [];



  findAll(): Warehouse[] {

    return this.warehouses;

  }



  findById(
    id: string,
  ): Warehouse | undefined {

    return this.warehouses.find(
      (warehouse) =>
        warehouse.id === id,
    );

  }



  create(
    warehouse: Warehouse,
  ): Warehouse {

    this.warehouses.push(
      warehouse,
    );

    return warehouse;

  }



  update(
    id: string,
    updates: Partial<Warehouse>,
  ): Warehouse | undefined {


    const index =
      this.warehouses.findIndex(
        (warehouse) =>
          warehouse.id === id,
      );



    if (index === -1) {

      return undefined;

    }



    this.warehouses[index] = {

      ...this.warehouses[index],

      ...updates,

      updatedAt:
        new Date().toISOString(),

    };



    return this.warehouses[index];

  }



  delete(
    id: string,
  ): boolean {


    const index =
      this.warehouses.findIndex(
        (warehouse) =>
          warehouse.id === id,
      );



    if (index === -1) {

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