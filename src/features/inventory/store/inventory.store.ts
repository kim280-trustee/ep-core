import {
  create,
} from "zustand";

import type {
  InventoryRecord,
} from "../types/inventory-record.types";


interface InventoryState {

  records: InventoryRecord[];

  setRecords: (
    records: InventoryRecord[],
  ) => void;

  addRecord: (
    record: InventoryRecord,
  ) => void;

  updateRecord: (
    record: InventoryRecord,
  ) => void;

  removeRecord: (
    id: string,
  ) => void;

  clearRecords: () => void;

  getRecordById: (
    id: string,
  ) => InventoryRecord | undefined;

  getProductRecords: (
    productId: string,
  ) => InventoryRecord[];

  getWarehouseRecords: (
    warehouseId: string,
  ) => InventoryRecord[];

}


export const useInventoryStore =
  create<InventoryState>(
    (set, get) => ({

      records: [],


      setRecords: (
        records,
      ) =>
        set({

          records: [
            ...records,
          ],

        }),



      addRecord: (
        record,
      ) =>
        set(
          (state) => {

            const exists =
              state.records.some(
                (item) =>
                  item.id === record.id,
              );


            if (exists) {

              throw new Error(
                "Inventory record already exists.",
              );

            }


            return {

              records: [

                ...state.records,

                record,

              ],

            };

          },
        ),



      updateRecord: (
        record,
      ) =>
        set(
          (state) => ({

            records:

              state.records.map(
                (item) =>

                  item.id === record.id

                    ? record

                    : item,

              ),

          }),
        ),



      removeRecord: (
        id,
      ) =>
        set(
          (state) => ({

            records:

              state.records.filter(
                (item) =>
                  item.id !== id,
              ),

          }),
        ),



      clearRecords: () =>
        set({

          records: [],

        }),



      getRecordById: (
        id,
      ) => {

        return get()
          .records
          .find(
            (record) =>
              record.id === id,
          );

      },



      getProductRecords: (
        productId,
      ) => {

        return get()
          .records
          .filter(
            (record) =>
              record.productId === productId,
          );

      },



      getWarehouseRecords: (
        warehouseId,
      ) => {

        return get()
          .records
          .filter(
            (record) =>
              record.warehouseId === warehouseId,
          );

      },


    }),
  );