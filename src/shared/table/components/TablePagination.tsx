interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function TablePagination({
  page,
  totalPages,
  onChange,
}: Props) {
  return (
    <div>
      <button
        disabled={page <= 1}
        onClick={() =>
          onChange(page - 1)
        }
      >
        Previous
      </button>

      <span>
        {page} / {totalPages}
      </span>

      <button
        disabled={page >= totalPages}
        onClick={() =>
          onChange(page + 1)
        }
      >
        Next
      </button>
    </div>
  );
}