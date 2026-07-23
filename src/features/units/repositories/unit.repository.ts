import type {
  Unit,
} from "../types/unit.types";


export interface IUnitRepository {


  findAll(): Unit[];


  findById(
    id: string,
  ): Unit | undefined;



  create(
    unit: Unit,
  ): Unit;



  update(
    id: string,
    updates: Partial<Unit>,
  ): Unit | undefined;



  delete(
    id: string,
  ): boolean;

}