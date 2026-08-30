import {
  useWarehouses,
} from "../hooks/useWarehouses";


import {
  useWarehouseActions,
} from "../hooks/useWarehouseActions";


import {
  WarehouseTable,
} from "../components/WarehouseTable";


import {
  WarehouseToolbar,
} from "../components/WarehouseToolbar";


export function WarehousesPage() {


  const {
    warehouses,
    loading,
    error,
    reload,
  } =
    useWarehouses();


  const {
    removeWarehouse,
    loading:
      deleting,
    error:
      deleteError,
  } =
    useWarehouseActions();


  async function handleDelete(
    id: string,
  ) {

    const confirmed =
      window.confirm(
        "Delete this warehouse?",
      );


    if (!confirmed) {

      return;

    }


    await removeWarehouse(
      id,
    );


    await reload();

  }


  if (loading) {

    return (

      <div>

        Loading warehouses...

      </div>

    );

  }


  if (error) {

    return (

      <div>

        <p>
          Failed to load warehouses.
        </p>


        <button
          type="button"
          onClick={() => {
            void reload();
          }}
        >
          Try again
        </button>

      </div>

    );

  }


  return (

    <div>

      <h1>
        Warehouses
      </h1>


      <WarehouseToolbar

        onReload={() => {
          void reload();
        }}

      />


      {deleteError && (

        <p>
          {deleteError.message}
        </p>

      )}


      {warehouses.length === 0 ? (

        <p>
          No warehouses found.
        </p>

      ) : (

        <WarehouseTable

          warehouses={
            warehouses
          }

          onDelete={
            deleting
              ? undefined
              : handleDelete
          }

        />

      )}

    </div>

  );

}
