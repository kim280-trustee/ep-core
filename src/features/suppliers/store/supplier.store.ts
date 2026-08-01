import {

create,

} from "zustand";



import type {

Supplier,

} from "../types/supplier.types";





interface SuppliersStore {


suppliers:Supplier[];



setSuppliers(

suppliers:Supplier[],

):void;



addSupplier(

supplier:Supplier,

):void;



updateSupplier(

supplier:Supplier,

):void;



removeSupplier(

id:string,

):void;


}





export const useSuppliersStore =

create<SuppliersStore>((set)=>({



suppliers:[],




setSuppliers(

suppliers,

){

set({

suppliers,

});

},





addSupplier(

supplier,

){

set(

state=>({

suppliers:[

...state.suppliers,

supplier,

],

}),

);

},





updateSupplier(

supplier,

){

set(

state=>({

suppliers:

state.suppliers.map(

item=>

item.id === supplier.id

?

supplier

:

item,

),

}),

);

},





removeSupplier(

id,

){

set(

state=>({

suppliers:

state.suppliers.filter(

item=>

item.id !== id,

),

}),

);

},



}));