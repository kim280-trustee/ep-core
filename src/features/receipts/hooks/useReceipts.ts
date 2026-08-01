import {
  useEffect,
} from "react";

import {
  useReceiptStore,
} from "../store";

export function useReceipts() {

  const store =
    useReceiptStore();

  useEffect(() => {

    store.loadReceipts();

  }, [store]);

  return store;

}