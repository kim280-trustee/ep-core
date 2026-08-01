/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Create Product Page
 * ============================================================
 */


import {
  ProductForm,
} from "../components/ProductForm";





export function CreateProductPage(){



return (


<div

className="
flex
flex-col
gap-6
"

>


<h1

className="
text-2xl
font-semibold
"

>

Create Product

</h1>




<ProductForm />


</div>


);



}