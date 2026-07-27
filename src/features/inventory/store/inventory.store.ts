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

}


export const useInventoryStore =
  create<InventoryState>(
    (set) => ({

      records: [],

      setRecords: (
        records,
      ) =>
        set({
          records,
        }),

      addRecord: (
        record,
      ) =>
        set(
          (state) => ({

            records: [

              ...state.records,

              record,

            ],

          }),
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

    }),
  );