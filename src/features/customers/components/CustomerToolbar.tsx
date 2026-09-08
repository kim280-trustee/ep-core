import {
  Link,
} from "react-router-dom";

import {
  Search,
  UserPlus,
} from "lucide-react";

interface CustomerToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function CustomerToolbar({
  search,
  onSearchChange,
}: CustomerToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search customers..."
          aria-label="Search customers"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <Link
        to="/customers/create"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <UserPlus className="h-4 w-4" />
        Add Customer
      </Link>
    </div>
  );
}
