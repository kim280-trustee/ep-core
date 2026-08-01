/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Duplicate Button
 * ============================================================
 */


interface ProductDuplicateButtonProps {


  onDuplicate:()=>void;


}



export function ProductDuplicateButton({

  onDuplicate,

}:ProductDuplicateButtonProps){



  return (


    <button


      onClick={onDuplicate}



      className="
      border
      px-3
      py-2
      rounded
      text-blue-600
      "


    >

      Duplicate


    </button>


  );


}