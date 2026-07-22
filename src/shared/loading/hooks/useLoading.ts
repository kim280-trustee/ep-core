import {
  useState,
} from "react";

export function useLoading(
  initial = false,
) {
  const [
    loading,
    setLoading,
  ] = useState(initial);

  return {
    loading,
    start: () =>
      setLoading(true),

    stop: () =>
      setLoading(false),
  };
}