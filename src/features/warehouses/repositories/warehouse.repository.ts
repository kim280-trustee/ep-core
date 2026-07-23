import type {
  Warehouse,
} from "../types/warehouse.types";


export interface IWarehouseRepository {


  findAll(): Warehouse[];


  findById(
    id: string,
  ): Warehouse | undefined;



  create(
    warehouse: Warehouse,
  ): Warehouse;



  update(
    id: string,
    updates: Partial<Warehouse>,
  ): Warehouse | undefined;



  delete(
    id: string,
  ): boolean;

}