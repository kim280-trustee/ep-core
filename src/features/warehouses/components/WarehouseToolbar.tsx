interface Props {

  search:string;

  onSearchChange(
    value:string
  ):void;

}


export function WarehouseToolbar({

  search,

  onSearchChange,

}:Props){


  return (

    <input

      value={search}

      onChange={(e)=>

        onSearchChange(
          e.target.value
        )

      }

      placeholder="Search warehouses"

    />

  );

}