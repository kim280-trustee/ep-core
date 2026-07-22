import {
  FormField,
} from "./FormField";

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
}

export function TextInput({
  name,
  label,
  placeholder,
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
            value={String(value ?? "")}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
          />
        </div>
      )}
    </FormField>
  );
}