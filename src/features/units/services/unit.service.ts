import {
  unitRepository,
} from "../repositories";


import type {
  Unit,
} from "../types/unit.types";


import type {
  UnitFormInput,
} from "../validators/unit.schema";



class UnitService {



  generateId(): string {

    return crypto.randomUUID();

  }



  getUnits(): Unit[] {

    return unitRepository.findAll();

  }



  getUnitById(
    id: string,
  ): Unit | undefined {

    return unitRepository.findById(id);

  }



  createUnit(

    input: UnitFormInput,

    tenantId: string,

    storeId: string,

  ): Unit {



    const now =
      new Date().toISOString();



    const unit: Unit = {

      id:
        this.generateId(),


      tenantId,


      storeId,


      name:
        input.name,


      symbol:
        input.symbol,


      description:
        input.description,


      status:
        "active",


      createdAt:
        now,


      updatedAt:
        now,

    };



    return unitRepository.create(
      unit,
    );

  }



  updateUnit(

    id: string,

    updates: Partial<Unit>,

  ) {


    return unitRepository.update(
      id,
      updates,
    );

  }



  deleteUnit(
    id: string,
  ): boolean {

    return unitRepository.delete(id);

  }


}



export const unitService =
  new UnitService();