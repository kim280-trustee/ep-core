/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Search
 * ============================================================
 */


interface ProductSearchProps {

  value: string;

  onChange: (
    value:string,
  ) => void;

}



export function ProductSearch({

  value,

  onChange,

}: ProductSearchProps){


  return (

    <input


      value={value}



      onChange={

        (event)=>

          onChange(

            event.target.value,

          )

      }



      placeholder="Search products..."



      className="
      border
      rounded
      px-3
      py-2
      w-full
      "

    />

  );

}