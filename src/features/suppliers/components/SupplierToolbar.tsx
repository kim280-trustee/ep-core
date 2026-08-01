/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * Supplier Toolbar
 * ============================================================
 */


interface SupplierToolbarProps {

  search: string;

  onSearchChange(
    value: string,
  ): void;

}



export function SupplierToolbar(
  {
    search,
    onSearchChange,
  }: SupplierToolbarProps,
) {


  return (

    <div>


      <input

        value={
          search
        }


        onChange={

          (event) =>

            onSearchChange(

              event.target.value,

            )

        }


        placeholder="Search suppliers"

      />


    </div>

  );

}