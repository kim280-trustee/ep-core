import type {
  PurchaseOrder,
} from "../types/purchase-order.types";


import type {
  PurchaseOrderRepository,
} from "./purchase-order.repository";



class InMemoryPurchaseOrderRepository
implements PurchaseOrderRepository {


  private orders: PurchaseOrder[] = [];



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





  findBySupplier(
    supplierId: string,
  ) {


    return this.orders.filter(

      (order) =>

        order.supplierId === supplierId,

    );

  }





  create(
    order: PurchaseOrder,
  ) {


    this.orders.push(
      order,
    );


    return order;

  }





  update(
    id: string,
    updates: Partial<PurchaseOrder>,
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



export const inMemoryPurchaseOrderRepository =

  new InMemoryPurchaseOrderRepository();