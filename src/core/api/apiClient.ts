import {
  HttpClient,
} from "./httpClient";

export const apiClient =
  new HttpClient(
    import.meta.env.VITE_API_URL ??
      "http://localhost:3000/api",
  );