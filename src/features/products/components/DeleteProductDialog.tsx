/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Delete Product Dialog
 * ============================================================
 */


interface DeleteProductDialogProps {


  open:boolean;


  productName:string;


  onConfirm:()=>void;


  onCancel:()=>void;


}




export function DeleteProductDialog({

  open,

  productName,

  onConfirm,

  onCancel,

}:DeleteProductDialogProps){



  if(!open){

    return null;

  }




  return (


    <div

      className="
      fixed
      inset-0
      flex
      items-center
      justify-center
      bg-black/30
      "

    >


      <div

        className="
        bg-white
        rounded
        p-6
        flex
        flex-col
        gap-4
        "

      >



        <h2

          className="
          font-semibold
          text-lg
          "

        >

          Delete Product


        </h2>





        <p>

          Are you sure you want to delete:

          {" "}

          <strong>

            {productName}

          </strong>

          ?

        </p>





        <div

          className="
          flex
          gap-3
          "

        >



          <button

            onClick={onCancel}

            className="
            border
            px-4
            py-2
            rounded
            "

          >

            Cancel


          </button>





          <button

            onClick={onConfirm}

            className="
            bg-red-600
            text-white
            px-4
            py-2
            rounded
            "

          >

            Delete


          </button>




        </div>



      </div>



    </div>


  );


}