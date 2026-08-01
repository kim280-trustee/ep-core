/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * In Memory Warehouse Repository
 * ============================================================
 */


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



  findAll() {

    return this.warehouses;

  }



  findById(
    id: string,
  ) {

    return this.warehouses.find(

      item =>
        item.id === id,

    );

  }



  create(
    warehouse:
      CreateWarehouseDto
      & {
        tenantId:string;
        storeId:string;
      },
  ) {


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



  update(
    id:string,
    warehouse:UpdateWarehouseDto,
  ) {


    const existing =
      this.findById(
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



  delete(
    id:string,
  ) {


    const index =

      this.warehouses.findIndex(

        item =>
          item.id === id,

      );



    if(index === -1){

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