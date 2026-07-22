import {
  FormField,
} from "./FormField";

interface Props {
  name: string;
  label?: string;
}

export function Checkbox({
  name,
  label,
}: Props) {
  return (
    <FormField name={name}>
      {({
        value,
        onChange,
      }) => (
        <label>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) =>
              onChange(
                event.target.checked,
              )
            }
          />

          {label}
        </label>
      )}
    </FormField>
  );
}