import type {
  TableColumn,
} from "../types/table.types";

import { TableBody } from "./TableBody";
import { TableHeader } from "./TableHeader";

interface Props<T> {
  columns: TableColumn<T>[];
  data: T[];
}

export function DataTable<T>({
  columns,
  data,
}: Props<T>) {
  return (
    <table>
      <TableHeader
        columns={columns}
      />

      <TableBody
        columns={columns}
        data={data}
      />
    </table>
  );
}