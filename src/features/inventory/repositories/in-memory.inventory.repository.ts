import type {
  InventoryRecord,
} from "../types/inventory-record.types";


import type {
  IInventoryRepository,
} from "./inventory.repository";



class InMemoryInventoryRepository

implements IInventoryRepository {



  private records: InventoryRecord[] = [];



  findAll():

    InventoryRecord[] {

    return [
      ...this.records,
    ];

  }





  findById(

    id: string,

  ):

    InventoryRecord | undefined {


    return this.records.find(

      (record) =>

        record.id === id,

    );


  }





  findByProduct(

    productId: string,

  ):

    InventoryRecord[] {


    return this.records.filter(

      (record) =>

        record.productId === productId,

    );


  }





  findByWarehouse(

    warehouseId: string,

  ):

    InventoryRecord[] {


    return this.records.filter(

      (record) =>

        record.warehouseId === warehouseId,

    );


  }





  findByProductAndWarehouse(

    productId: string,

    warehouseId: string,

  ):

    InventoryRecord | undefined {


    return this.records.find(

      (record) =>

        record.productId === productId &&

        record.warehouseId === warehouseId,

    );


  }





  create(

    record: InventoryRecord,

  ):

    InventoryRecord {


    this.records.push(

      record,

    );


    return record;


  }





  update(

    id: string,

    updates: Partial<InventoryRecord>,

  ):

    InventoryRecord | undefined {



    const index =

      this.records.findIndex(

        (record) =>

          record.id === id,

      );



    if (index === -1) {

      return undefined;

    }



    const updatedRecord = {


      ...this.records[index],


      ...updates,


      updatedAt:

        new Date().toISOString(),


    };



    this.records[index] = updatedRecord;



    return updatedRecord;


  }





  delete(

    id: string,

  ):

    boolean {



    const initialLength =

      this.records.length;



    this.records =

      this.records.filter(

        (record) =>

          record.id !== id,

      );



    return (

      this.records.length !== initialLength

    );


  }


}



export const inMemoryInventoryRepository =

  new InMemoryInventoryRepository();