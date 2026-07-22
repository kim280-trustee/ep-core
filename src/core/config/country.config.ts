export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  vatRate: number;
}

export const countries = {
  TH: {
    code: "TH",
    name: "Thailand",
    currency: "THB",
    vatRate: 7,
  },

  KE: {
    code: "KE",
    name: "Kenya",
    currency: "KES",
    vatRate: 16,
  },
} satisfies Record<
  string,
  CountryConfig
>;