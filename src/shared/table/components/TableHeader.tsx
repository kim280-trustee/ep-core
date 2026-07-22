import type {
  TableColumn,
} from "../types/table.types";

interface Props<T> {
  columns: TableColumn<T>[];
}

export function TableHeader<T>({
  columns,
}: Props<T>) {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th key={String(column.key)}>
            {column.title}
          </th>
        ))}
      </tr>
    </thead>
  );
}