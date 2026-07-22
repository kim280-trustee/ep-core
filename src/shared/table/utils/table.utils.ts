export function calculateTotalPages(
  totalItems: number,
  pageSize: number,
): number {
  return Math.ceil(totalItems / pageSize);
}

export function getRowValue<T>(
  row: T,
  key: keyof T,
) {
  return row[key];
}