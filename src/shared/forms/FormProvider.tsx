import type { ReactNode } from "react";

import {
  FormProvider as RHFProvider,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

interface Props<T extends FieldValues> {
  methods: UseFormReturn<T>;
  children: ReactNode;
}

export function FormProvider<T extends FieldValues>({
  methods,
  children,
}: Props<T>) {
  return (
    <RHFProvider {...methods}>
      {children}
    </RHFProvider>
  );
}