import {
  useEffect,
} from "react";

import {
  usePosSalesStore,
} from "../store/pos-sales.store";

import {
  saleService,
} from "../services/sale.service";

export function useSales() {
  const sales =
    usePosSalesStore(
      (state) =>
        state.sales,
    );

  const setSales =
    usePosSalesStore(
      (state) =>
        state.setSales,
    );

  useEffect(() => {
    const loaded =
      saleService.getSales();

    setSales(
      loaded as never[],
    );
  }, [setSales]);

  return {
    sales,
    refreshSales: () => {
      setSales(
        saleService.getSales() as never[],
      );
    },
  };
}