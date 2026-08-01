/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Products Store
 * ============================================================
 */


import {
  create,
} from "zustand";


import {
  productService,
} from "../services/product.service";


import type {
  Product,
} from "../types/product.types";


import {
  ProductStatus,
} from "../types/product.types";







interface ProductsStore {



  products: Product[];


  search:string;


  statusFilter: ProductStatus | "ALL";




  loadProducts:()=>void;



  addProduct:(

    product:Product,

  )=>void;



  updateProduct:(

    product:Product,

  )=>void;



  deleteProduct:(

    id:string,

  )=>void;



  duplicateProduct:(

    product:Product,

  )=>void;



  setSearch:(

    value:string,

  )=>void;



  setStatusFilter:(

    value:ProductStatus | "ALL",

  )=>void;



}









export const useProductsStore =

create<ProductsStore>(

(set)=>({



products:[],


search:"",


statusFilter:"ALL",







loadProducts(){



set({

products:

productService.getProducts(),

});



},







addProduct(product){



set((state)=>({


products:[

...state.products,

product,

],



}));



},







updateProduct(product){



set((state)=>({



products:

state.products.map(

item=>

item.id === product.id

?

product

:

item,


),



}));



},







deleteProduct(id){



productService.deleteProduct(

id,

);




set({


products:

productService.getProducts(),


});



},







duplicateProduct(product){



const duplicate:Product={



...product,



id:

crypto.randomUUID(),



name:

`${product.name} Copy`,



createdAt:

new Date().toISOString(),



updatedAt:

new Date().toISOString(),



};





set((state)=>({


products:[

...state.products,

duplicate,

],



}));



},








setSearch(value){



set({

search:value,

});



},







setStatusFilter(value){



set({

statusFilter:value,

});



},







})

);