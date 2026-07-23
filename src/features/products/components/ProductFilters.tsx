interface ProductFiltersProps {
  status: string;
  onChange: (value: string) => void;
}


export function ProductFilters({
  status,
  onChange,
}: ProductFiltersProps) {

  return (
    <select
      value={status}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="
        border
        rounded
        p-2
      "
    >
      <option value="all">
        All
      </option>

      <option value="active">
        Active
      </option>

      <option value="inactive">
        Inactive
      </option>

    </select>
  );
}