import { useCallback, useState } from "react";
import { goodsReceiptService } from "../services/goods-receipt.service";
import type { GoodsReceipt } from "../types/goods-receipt.types";

type CreateGoodsReceiptInput =
  Parameters<typeof goodsReceiptService.createReceipt>[0];

export function useGoodsReceipts() {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReceipts = useCallback(async (tenantId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await goodsReceiptService.getReceipts(tenantId);
      setReceipts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load goods receipts."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(
    (tenantId: string, id: string) =>
      goodsReceiptService.getReceiptById(tenantId, id),
    []
  );

  const create = useCallback(
    async (input: CreateGoodsReceiptInput) => {
      const receipt =
        await goodsReceiptService.createReceipt(input);

      setReceipts((current) => [...current, receipt]);

      return receipt;
    },
    []
  );

  return {
    receipts,
    loading,
    error,
    loadReceipts,
    refresh: loadReceipts,
    getById,
    create,
  };
}
