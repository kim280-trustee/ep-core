import type {
  Sale,
} from "../types/sale.types";


import type {
  SaleRepository,
} from "./sale.repository";



class InMemorySaleRepository
implements SaleRepository {


  private sales: Sale[] = [];



  findAll() {

    return this.sales;

  }



  findById(
    id: string,
  ) {

    return this.sales.find(

      sale =>

        sale.id === id,

    );

  }



  create(
    sale: Sale,
  ) {

    this.sales.push(
      sale,
    );


    return sale;

  }



  update(

    id: string,

    updates: Partial<Sale>,

  ) {


    const index =

      this.sales.findIndex(

        sale =>

          sale.id === id,

      );



    if(index === -1) {

      return undefined;

    }



    this.sales[index] = {


      ...this.sales[index],


      ...updates,


      updatedAt:

        new Date().toISOString(),


    };



    return this.sales[index];

  }


}



export const inMemorySaleRepository =

  new InMemorySaleRepository();