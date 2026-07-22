import {
  FormField,
} from "./FormField";

interface Props {
  name: string;
  label?: string;
}

export function NumberInput({
  name,
  label,
}: Props) {
  return (
    <FormField name={name}>
      {({
        value,
        onChange,
        onBlur,
      }) => (
        <div>
          {label && (
            <label>
              {label}
            </label>
          )}

          <input
            type="number"
            value={Number(value ?? 0)}
            onChange={(event) =>
              onChange(
                Number(event.target.value),
              )
            }
            onBlur={onBlur}
          />
        </div>
      )}
    </FormField>
  );
}