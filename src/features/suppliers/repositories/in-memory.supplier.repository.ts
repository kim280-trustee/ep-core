import type {
  Supplier,
} from "../types/supplier.types";


import type {
  ISupplierRepository,
} from "./supplier.repository";




class InMemorySupplierRepository

implements ISupplierRepository {



private suppliers:Supplier[] = [];





findAll(){

  return this.suppliers;

}





findById(

id:string,

){

 return this.suppliers.find(

  supplier =>

    supplier.id === id,

 );

}





create(

supplier:Supplier,

){

 this.suppliers.push(

  supplier,

 );

 return supplier;

}





update(

id:string,

updates:Partial<Supplier>,

){


 const index =

 this.suppliers.findIndex(

  supplier =>

  supplier.id === id,

 );




 if(index === -1){

  return undefined;

 }



 this.suppliers[index] = {


  ...this.suppliers[index],


  ...updates,


  updatedAt:

   new Date().toISOString(),


 };



 return this.suppliers[index];


}





delete(

id:string,

){


 const index =

 this.suppliers.findIndex(

 supplier =>

 supplier.id === id,

 );



 if(index === -1){

  return false;

 }



 this.suppliers.splice(

  index,

  1,

 );



 return true;


}



}





export const inMemorySupplierRepository =

new InMemorySupplierRepository();