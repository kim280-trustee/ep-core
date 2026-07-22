import {
  FormField,
} from "./FormField";

interface Props {
  name: string;
  label?: string;
}

export function TextArea({
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

          <textarea
            value={String(value ?? "")}
            onChange={onChange}
            onBlur={onBlur}
          />
        </div>
      )}
    </FormField>
  );
}