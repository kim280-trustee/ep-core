import { Search, X } from "lucide-react";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ProductSearch({
  value,
  onChange,
  placeholder = "Search products...",
  disabled = false,
}: ProductSearchProps) {
  return (
    <div className="relative w-full">
      <Search
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}