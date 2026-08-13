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




  costPrice:number;


  onCostPriceChange:(

    value:number,

  )=>void;




  sellingPrice:number;


  onSellingPriceChange:(

    value:number,

  )=>void;



}





export function ProductFormFields({

  name,

  onNameChange,

  sku,

  onSkuChange,

  costPrice,

  onCostPriceChange,

  sellingPrice,

  onSellingPriceChange,

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

        onChange={(event)=>

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

        onChange={(event)=>

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

        value={costPrice}

        onChange={(event)=>

          onCostPriceChange(

            Number(event.target.value),

          )

        }

        placeholder="Cost price"

        className="
        border
        rounded
        px-3
        py-2
        "

      />








      <input

        type="number"

        value={sellingPrice}

        onChange={(event)=>

          onSellingPriceChange(

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