import {
  warehouseRepository,
} from "../repositories";


import type {
  Warehouse,
} from "../types/warehouse.types";


import type {
  WarehouseFormInput,
} from "../validators/warehouse.schema";



class WarehouseService {



  generateId(): string {

    return crypto.randomUUID();

  }



  getWarehouses(): Warehouse[] {

    return warehouseRepository.findAll();

  }



  getWarehouseById(
    id: string,
  ): Warehouse | undefined {

    return warehouseRepository.findById(id);

  }



  createWarehouse(

    input: WarehouseFormInput,

    tenantId: string,

    storeId: string,

  ): Warehouse {



    const now =
      new Date().toISOString();



    const warehouse: Warehouse = {

      id:
        this.generateId(),


      tenantId,


      storeId,


      name:
        input.name,


      code:
        input.code,


      address:
        input.address,


      phone:
        input.phone,


      status:
        "active",


      createdAt:
        now,


      updatedAt:
        now,

    };



    return warehouseRepository.create(
      warehouse,
    );

  }



  updateWarehouse(

    id: string,

    updates: Partial<Warehouse>,

  ) {


    return warehouseRepository.update(
      id,
      updates,
    );

  }



  deleteWarehouse(
    id: string,
  ): boolean {

    return warehouseRepository.delete(id);

  }


}



export const warehouseService =
  new WarehouseService();