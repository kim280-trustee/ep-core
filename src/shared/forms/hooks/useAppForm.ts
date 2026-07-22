import {
  useForm,
  type FieldValues,
  type UseFormProps,
} from "react-hook-form";

export function useAppForm<T extends FieldValues>(
  options?: UseFormProps<T>,
) {
  return useForm<T>(options);
}