/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Error Message
 * ============================================================
 */


interface ProductErrorMessageProps {


  message?:string;


}





export function ProductErrorMessage({

  message,

}:ProductErrorMessageProps){



  if(!message){

    return null;

  }




  return (


    <div

      className="
      border
      border-red-300
      bg-red-50
      text-red-700
      rounded
      p-3
      "

    >


      {message}


    </div>


  );


}