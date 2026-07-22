import {
  FormField,
} from "./FormField";

interface Option {
  label: string;
  value: string;
}

interface Props {
  name: string;
  options: Option[];
}

export function Select({
  name,
  options,
}: Props) {
  return (
    <FormField name={name}>
      {({
        value,
        onChange,
      }) => (
        <select
          value={String(value ?? "")}
          onChange={onChange}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}