export interface CurrencyConfig {
  code: string;
  symbol: string;
  decimals: number;
}

export const currencies = {
  THB: {
    code: "THB",
    symbol: "฿",
    decimals: 2,
  },

  KES: {
    code: "KES",
    symbol: "KSh",
    decimals: 2,
  },
} satisfies Record<
  string,
  CurrencyConfig
>;