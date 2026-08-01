/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Form Fields
 * ============================================================
 */


interface ProductFormFieldsProps {


  name:string;


  onNameChange:(

    value:string,

  )=>void;



  sku:string;


  onSkuChange:(

    value:string,

  )=>void;



  price:number;


  onPriceChange:(

    value:number,

  )=>void;


}






export function ProductFormFields({

  name,

  onNameChange,

  sku,

  onSkuChange,

  price,

  onPriceChange,

}:ProductFormFieldsProps){



  return (


    <div

      className="
      flex
      flex-col
      gap-4
      "

    >




      <input


        value={name}



        onChange={

          (event)=>

            onNameChange(

              event.target.value,

            )

        }



        placeholder="Product name"



        className="
        border
        rounded
        px-3
        py-2
        "


      />





      <input


        value={sku}



        onChange={

          (event)=>

            onSkuChange(

              event.target.value,

            )

        }



        placeholder="SKU"



        className="
        border
        rounded
        px-3
        py-2
        "


      />






      <input


        type="number"



        value={price}



        onChange={

          (event)=>

            onPriceChange(

              Number(event.target.value),

            )

        }



        placeholder="Selling price"



        className="
        border
        rounded
        px-3
        py-2
        "


      />



    </div>


  );


}