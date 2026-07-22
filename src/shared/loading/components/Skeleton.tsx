interface Props {
  width?: string;
  height?: string;
}

export function Skeleton({
  width = "100%",
  height = "20px",
}: Props) {
  return (
    <div
      style={{
        width,
        height,
      }}
    />
  );
}