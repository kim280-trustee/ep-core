import {
  z,
} from "zod";

export const expenseCategories = [
  "RENT",
  "SALARY",
  "ELECTRICITY",
  "WATER",
  "INTERNET",
  "TRANSPORT",
  "MARKETING",
  "OFFICE_SUPPLIES",
  "MAINTENANCE",
  "OTHER",
] as const;

export const expenseSchema =
  z.object({

    category:
      z.enum(
        expenseCategories,
      ),

    description:
      z.string()
        .trim()
        .min(
          1,
          "Description is required",
        ),

    amount:
      z.number()
        .finite()
        .positive(
          "Amount must be greater than zero",
        ),

    currency:
      z.string()
        .trim()
        .min(
          1,
          "Currency is required",
        ),

    expenseDate:
      z.string()
        .min(
          1,
          "Expense date is required",
        ),

  });

export type ExpenseFormInput =
  z.infer<
    typeof expenseSchema
  >;
