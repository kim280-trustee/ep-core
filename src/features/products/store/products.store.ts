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
  UpdateProductDto,
} from "../types/product.types";


import {
  ProductStatus,
} from "../types/product.types";





interface ProductsStore {


  products: Product[];


  search:string;


  statusFilter: ProductStatus | "ALL";



  loadProducts():void;


  addProduct(
    product:Product,
  ):void;



  updateProduct(
    productOrId: Product | string,
    updates?: UpdateProductDto,
  ):void;



  deleteProduct(
    id:string,
  ):void;



  duplicateProduct(
    product:Product,
  ):void;



  setSearch(
    value:string,
  ):void;



  setStatusFilter(
    value:ProductStatus | "ALL",
  ):void;



}








export const useProductsStore =

create<ProductsStore>((set)=>({




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







updateProduct(

productOrId,

updates,

){



let updatedProduct:Product | undefined;



if(typeof productOrId === "string"){



updatedProduct =

productService.updateProduct(

productOrId,

updates ?? {},

);



}

else {



updatedProduct =

productService.updateProduct(

productOrId.id,

productOrId,

);



}





if(!updatedProduct){

return;

}







set((state)=>({


products:

state.products.map(

item =>

item.id === updatedProduct!.id

?

updatedProduct!

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



const duplicate =

productService.duplicateProduct(

product,

);




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







}));