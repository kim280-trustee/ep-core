interface Props {
  size?: "small" | "medium" | "large";
}

export function Spinner({
  size = "medium",
}: Props) {
  return (
    <div>
      Loading ({size})
    </div>
  );
}