interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
}


export function ProductSearch({
  value,
  onChange,
}: ProductSearchProps) {

  return (
    <input
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      placeholder="Search products..."
      className="
        border
        rounded
        p-2
        w-full
      "
    />
  );
}