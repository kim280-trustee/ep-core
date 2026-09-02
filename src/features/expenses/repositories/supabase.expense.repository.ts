import {
  supabase,
} from "@/core/infrastructure/supabase/client";

import type {
  Expense,
} from "../types";

import type {
  ExpenseRepository,
} from "./expense.repository";


interface ExpenseDatabaseRow {
  id: string;

  tenant_id: string;

  store_id: string;

  category: string;

  description: string;

  amount: number | string;

  currency: string;

  expense_date: string;

  created_at: string;

  updated_at: string;
}


function fromDatabaseRow(
  row: ExpenseDatabaseRow,
): Expense {
  return {
    id:
      row.id,

    tenantId:
      row.tenant_id,

    storeId:
      row.store_id,

    category:
      row.category as Expense["category"],

    description:
      row.description,

    amount:
      Number(row.amount),

    currency:
      row.currency,

    expenseDate:
      row.expense_date,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}


class SupabaseExpenseRepository
implements ExpenseRepository {

  async findAll(
    tenantId: string,
    storeId: string,
  ): Promise<Expense[]> {

    const {
      data,
      error,
    } =
      await supabase
        .from("expenses")
        .select("*")
        .eq(
          "tenant_id",
          tenantId,
        )
        .eq(
          "store_id",
          storeId,
        )
        .order(
          "expense_date",
          {
            ascending: false,
          },
        );

    if (error) {
      throw error;
    }

    return (
      (data ?? []) as ExpenseDatabaseRow[]
    ).map(
      fromDatabaseRow,
    );
  }


  async findById(
    tenantId: string,
    storeId: string,
    id: string,
  ): Promise<Expense | undefined> {

    const {
      data,
      error,
    } =
      await supabase
        .from("expenses")
        .select("*")
        .eq(
          "tenant_id",
          tenantId,
        )
        .eq(
          "store_id",
          storeId,
        )
        .eq(
          "id",
          id,
        )
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return undefined;
    }

    return fromDatabaseRow(
      data as ExpenseDatabaseRow,
    );
  }


  async create(
    expense: Expense,
  ): Promise<Expense> {

    const {
      data,
      error,
    } =
      await supabase
        .from("expenses")
        .insert({
          id:
            expense.id,

          tenant_id:
            expense.tenantId,

          store_id:
            expense.storeId,

          category:
            expense.category,

          description:
            expense.description,

          amount:
            expense.amount,

          currency:
            expense.currency,

          expense_date:
            expense.expenseDate,

          created_at:
            expense.createdAt,

          updated_at:
            expense.updatedAt,
        })
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    return fromDatabaseRow(
      data as ExpenseDatabaseRow,
    );
  }


  async update(
    tenantId: string,
    storeId: string,
    id: string,
    updates: Partial<Expense>,
  ): Promise<Expense | undefined> {

    const updateData:
      Record<string, unknown> = {};

    if (
      updates.category !== undefined
    ) {
      updateData.category =
        updates.category;
    }

    if (
      updates.description !== undefined
    ) {
      updateData.description =
        updates.description;
    }

    if (
      updates.amount !== undefined
    ) {
      updateData.amount =
        updates.amount;
    }

    if (
      updates.currency !== undefined
    ) {
      updateData.currency =
        updates.currency;
    }

    if (
      updates.expenseDate !== undefined
    ) {
      updateData.expense_date =
        updates.expenseDate;
    }

    updateData.updated_at =
      new Date().toISOString();

    const {
      data,
      error,
    } =
      await supabase
        .from("expenses")
        .update(updateData)
        .eq(
          "tenant_id",
          tenantId,
        )
        .eq(
          "store_id",
          storeId,
        )
        .eq(
          "id",
          id,
        )
        .select("*")
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return undefined;
    }

    return fromDatabaseRow(
      data as ExpenseDatabaseRow,
    );
  }


  async delete(
    tenantId: string,
    storeId: string,
    id: string,
  ): Promise<void> {

    const {
      error,
    } =
      await supabase
        .from("expenses")
        .delete()
        .eq(
          "tenant_id",
          tenantId,
        )
        .eq(
          "store_id",
          storeId,
        )
        .eq(
          "id",
          id,
        );

    if (error) {
      throw error;
    }
  }
}


export const supabaseExpenseRepository =
  new SupabaseExpenseRepository();
