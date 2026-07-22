import {
  Checkbox,
} from "./Checkbox";

interface Props {
  name: string;
  label?: string;
}

export function Switch(props: Props) {
  return (
    <Checkbox {...props} />
  );
}