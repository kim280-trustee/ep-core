/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Actions
 * ============================================================
 */


interface ProductActionsProps {


  onSubmit:()=>void;


  label:string;


}





export function ProductActions({

  onSubmit,

  label,

}:ProductActionsProps){



  return (


    <button


      onClick={onSubmit}



      className="
      bg-black
      text-white
      px-4
      py-2
      rounded
      "

    >


      {label}


    </button>


  );


}