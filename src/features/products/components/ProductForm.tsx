/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Form
 * ============================================================
 */


import {
  useEffect,
  useState,
} from "react";


import {
  productService,
} from "../services/product.service";


import {
  useProductsStore,
} from "../store/products.store";


import {
  ProductFormFields,
} from "./ProductFormFields";


import {
  ProductActions,
} from "./ProductActions";


import {
  ProductErrorMessage,
} from "./ProductErrorMessage";


import {
  ProductLoading,
} from "./ProductLoading";







interface ProductFormProps {


  productId?: string;


}







export function ProductForm({

  productId,

}:ProductFormProps){





const addProduct =

useProductsStore(

state=>state.addProduct,

);





const updateProduct =

useProductsStore(

state=>state.updateProduct,

);








const [name,setName] =

useState("");



const [sku,setSku] =

useState("");



const [price,setPrice] =

useState(0);





const [loading,setLoading] =

useState(false);





const [error,setError] =

useState("");










useEffect(()=>{



if(!productId){

return;

}





const product =

productService.getProductById(

productId,

);






if(product){


setName(product.name);


setSku(product.identifiers.sku);


setPrice(

product.pricing.sellingPrice,

);


}



},[productId]);











function handleSubmit(){



try {



setLoading(true);


setError("");







if(productId){



const existing =

productService.getProductById(

productId,

);







if(existing){



updateProduct({


...existing,


name,


identifiers:{


...existing.identifiers,


sku,


},



pricing:{


...existing.pricing,


sellingPrice:price,


},



updatedAt:

new Date().toISOString(),



});



}



return;


}









const product =

productService.createProduct(

"default-tenant",

"default-store",

{


name,


identifiers:{


sku,


barcode:null,


},



pricing:{


costPrice:0,


sellingPrice:price,


currency:"THB",


},



inventory:{


trackInventory:true,


stockQuantity:0,


},



},



);







addProduct(product);





setName("");

setSku("");

setPrice(0);






}

catch(error){



setError(

error instanceof Error

? error.message

: "Something went wrong"

);


}



finally{


setLoading(false);


}



}











if(loading){



return (

<ProductLoading />

);


}










return (


<div

className="
flex
flex-col
gap-5
"

>



<ProductErrorMessage

message={error}

/>





<ProductFormFields


name={name}


onNameChange={setName}


sku={sku}


onSkuChange={setSku}


price={price}


onPriceChange={setPrice}


/>







<ProductActions


onSubmit={handleSubmit}



label={

productId

? "Update Product"

: "Create Product"

}


/>






</div>


);



}