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
        <div className="flex flex-col gap-1.5">
          {label && (
            <label className="text-sm font-medium text-gray-700">
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
            className="
              min-h-11
              w-full
              rounded-lg
              border
              border-gray-300
              bg-white
              px-3
              py-2
              text-sm
              text-gray-900
              shadow-sm
              outline-none
              transition
              placeholder:text-gray-400
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/20
            "
          />
        </div>
      )}
    </FormField>
  );
}
