import type {
  SalesOrder,
} from "../types/sales-order.types";


import type {
  SalesOrderRepository,
} from "./sales-order.repository";



class InMemorySalesOrderRepository

implements SalesOrderRepository {



  private orders: SalesOrder[] = [];



  findAll() {

    return this.orders;

  }





  findById(
    id: string,
  ) {

    return this.orders.find(

      (order) =>

        order.id === id,

    );

  }





  create(
    order: SalesOrder,
  ) {

    this.orders.push(

      order,

    );


    return order;

  }





  update(

    id: string,

    updates: Partial<SalesOrder>,

  ) {


    const index =

      this.orders.findIndex(

        (order) =>

          order.id === id,

      );



    if (index === -1) {

      return undefined;

    }



    this.orders[index] = {

      ...this.orders[index],

      ...updates,

      updatedAt:

        new Date().toISOString(),

    };



    return this.orders[index];

  }


}



export const inMemorySalesOrderRepository =

  new InMemorySalesOrderRepository();