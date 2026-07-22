import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
} from "react-hook-form";

import type { ReactElement } from "react";

interface Props<T extends FieldValues> {
  name: Path<T>;
  children: (field: {
    value: unknown;
    onChange: (...event: unknown[]) => void;
    onBlur: () => void;
  }) => ReactElement;
}

export function FormField<T extends FieldValues>({
  name,
  children,
}: Props<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller<T, Path<T>>
      name={name}
      control={control}
      render={({ field }) =>
        children(field)
      }
    />
  );
}