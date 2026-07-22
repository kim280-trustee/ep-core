export function attachToken(
  token: string,
) {
  return {
    Authorization:
      `Bearer ${token}`,
  };
}