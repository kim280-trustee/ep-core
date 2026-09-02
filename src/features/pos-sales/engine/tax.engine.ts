import type { CompanySettings } from "@/features/settings/types";

export interface TaxResolutionInput {
  settings?: CompanySettings;
  productTaxRate?: number | null;
  productHasTaxConfiguration?: boolean;
  currency?: string | null;
}

export interface TaxResolution {
  enabled: boolean;
  rate: number;
  source:
    | "PRODUCT"
    | "COMPANY"
    | "COUNTRY_DEFAULT"
    | "DISABLED"
    | "UNCONFIGURED";
}

const COUNTRY_DEFAULT_RATES: Record<string, number> = {
  THAILAND: 7,
  TH: 7,

  KENYA: 16,
  KE: 16,

  UGANDA: 18,
  UG: 18,

  TANZANIA: 18,
  TZ: 18,

  RWANDA: 18,
  RW: 18,
};

const CURRENCY_DEFAULT_COUNTRIES: Record<string, string> = {
  THB: "THAILAND",
  KES: "KENYA",
  UGX: "UGANDA",
  TZS: "TANZANIA",
  RWF: "RWANDA",
};

function normalizeCountry(
  country?: string | null,
): string {
  return (country ?? "")
    .trim()
    .toUpperCase();
}

function normalizeCurrency(
  currency?: string | null,
): string {
  return (currency ?? "")
    .trim()
    .toUpperCase();
}

function getCountryDefaultRate(
  country?: string | null,
  currency?: string | null,
): number {
  const normalizedCountry =
    normalizeCountry(country);

  if (
    normalizedCountry &&
    COUNTRY_DEFAULT_RATES[
      normalizedCountry
    ] !== undefined
  ) {
    return COUNTRY_DEFAULT_RATES[
      normalizedCountry
    ];
  }

  const normalizedCurrency =
    normalizeCurrency(currency);

  const currencyCountry =
    CURRENCY_DEFAULT_COUNTRIES[
      normalizedCurrency
    ];

  if (
    currencyCountry &&
    COUNTRY_DEFAULT_RATES[
      currencyCountry
    ] !== undefined
  ) {
    return COUNTRY_DEFAULT_RATES[
      currencyCountry
    ];
  }

  return 0;
}

function isValidRate(
  value: number | null | undefined,
): value is number {
  return (
    value !== null &&
    value !== undefined &&
    Number.isFinite(value) &&
    value >= 0
  );
}

class TaxEngine {
  resolve(
    input: TaxResolutionInput,
  ): TaxResolution {
    const settings =
      input.settings;

    if (
      settings &&
      settings.taxEnabled === false
    ) {
      return {
        enabled: false,
        rate: 0,
        source: "DISABLED",
      };
    }

    /*
     * A product tax configuration is an explicit
     * product-level override.
     *
     * A zero rate is considered an explicit
     * zero-rated product only when the product
     * actually has a tax configuration.
     */
    if (
      input.productHasTaxConfiguration &&
      isValidRate(
        input.productTaxRate,
      )
    ) {
      return {
        enabled:
          input.productTaxRate > 0,
        rate:
          input.productTaxRate,
        source: "PRODUCT",
      };
    }

    /*
     * A positive company tax rate is the
     * configured business-level rate.
     */
    if (
      settings?.taxEnabled &&
      isValidRate(settings.taxRate) &&
      settings.taxRate > 0
    ) {
      return {
        enabled: true,
        rate: settings.taxRate,
        source: "COMPANY",
      };
    }

    const countryRate =
      getCountryDefaultRate(
        settings?.country,
        settings?.currency ??
          input.currency,
      );

    if (countryRate > 0) {
      return {
        enabled: true,
        rate: countryRate,
        source: "COUNTRY_DEFAULT",
      };
    }

    return {
      enabled: false,
      rate: 0,
      source: "UNCONFIGURED",
    };
  }
}

export const taxEngine =
  new TaxEngine();
