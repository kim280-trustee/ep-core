export const samplePaymentMethods = [

  {
    name: "Cash",

    code: "CASH",

    type: "cash" as const,

    isDefault: true,

    isActive: true,

  },

  {
    name: "PromptPay",

    code: "QR",

    type: "qr" as const,

    isDefault: false,

    isActive: true,

  },

];