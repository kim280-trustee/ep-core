interface DeleteProductDialogProps {

  open: boolean;

  productName?: string;

  onConfirm: () => void;

  onCancel: () => void;

}


export function DeleteProductDialog({

  open,

  productName,

  onConfirm,

  onCancel,

}: DeleteProductDialogProps) {


  if (!open) {
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
        bg-black/40
      "
    >

      <div
        className="
          bg-white
          rounded
          p-6
        "
      >

        <h2
          className="
            font-semibold
            mb-4
          "
        >
          Delete Product
        </h2>


        <p className="mb-4">

          Are you sure you want to delete
          {" "}
          {productName}?

        </p>


        <div
          className="
            flex
            gap-3
          "
        >

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


        </div>

      </div>

    </div>

  );

}