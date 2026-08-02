/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Form
 * ============================================================
 */


import {
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

}: ProductFormProps) {



const product =

productId

?

productService.getProductById(

  productId,

)

:

undefined;




const addProduct =

useProductsStore(

state => state.addProduct,

);



const updateProduct =

useProductsStore(

state => state.updateProduct,

);





const [

name,

setName,

] = useState(

product?.name ?? "",

);



const [

sku,

setSku,

] = useState(

product?.identifiers.sku ?? "",

);



const [

price,

setPrice,

] = useState(

product?.pricing.sellingPrice ?? 0,

);





const [

loading,

setLoading,

] = useState(false);



const [

error,

setError,

] = useState("");







function handleSubmit() {



try {



setLoading(true);

setError("");





if(productId) {



const existing =

productService.getProductById(

productId,

);





if(existing) {



updateProduct(

existing.id,

{

name,


identifiers:{

sku,

},


pricing:{

sellingPrice:price,

},


},

);



}



return;



}







const newProduct =

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





addProduct(newProduct);





setName("");

setSku("");

setPrice(0);





}



catch(error){



setError(

error instanceof Error

?

error.message

:

"Something went wrong",

);



}



finally {



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

?

"Update Product"

:

"Create Product"

}


/>





</div>


);



}