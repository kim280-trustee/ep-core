/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Units Module
 * ------------------------------------------------------------
 * Unit Business Service
 * ============================================================
 */


import {
  unitRepository,
} from "../repositories";


import {
  UnitStatus,
} from "../types/unit.types";


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
    id:string,
  ):Unit|undefined {


    return unitRepository.findById(
      id,
    );

  }





  createUnit(

    input:UnitFormInput,

    tenantId:string,

    storeId:string,

  ):Unit {


    const now =
      new Date().toISOString();



    const unit:Unit={


      id:
        this.generateId(),


      tenantId,


      storeId,


      name:
        input.name,


      symbol:
        input.symbol,


      description:
        input.description ?? null,


      status:
        UnitStatus.ACTIVE,


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

    id:string,

    updates:Partial<Unit>,

  ):Unit|undefined {


    return unitRepository.update(

      id,

      {

        ...updates,


        updatedAt:

          new Date().toISOString(),

      },

    );

  }





  deleteUnit(
    id:string,
  ):boolean {


    return unitRepository.delete(
      id,
    );

  }


}



export const unitService =
  new UnitService();