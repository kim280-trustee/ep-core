import type {
  TableColumn,
} from "../types/table.types";

interface Props<T> {
  columns: TableColumn<T>[];
  data: T[];
}

export function TableBody<T>({
  columns,
  data,
}: Props<T>) {
  return (
    <tbody>
      {data.map((row, index) => (
        <tr key={index}>
          {columns.map((column) => (
            <td key={String(column.key)}>
              {column.render
                ? column.render(row)
                : String(
                    row[
                      column.key as keyof T
                    ],
                  )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}