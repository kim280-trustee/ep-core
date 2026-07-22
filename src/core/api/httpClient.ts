export interface HttpRequestConfig {
  headers?: Record<string, string>;
  body?: unknown;
}

export class HttpClient {
  private baseUrl: string;

  constructor(
    baseUrl: string,
  ) {
    this.baseUrl = baseUrl;
  }

  async get<T>(
    path: string,
  ): Promise<T> {
    const response =
      await fetch(
        `${this.baseUrl}${path}`,
      );

    return response.json();
  }

  async post<T>(
    path: string,
    config?: HttpRequestConfig,
  ): Promise<T> {
    const response =
      await fetch(
        `${this.baseUrl}${path}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            ...config?.headers,
          },
          body: JSON.stringify(
            config?.body,
          ),
        },
      );

    return response.json();
  }

  async put<T>(
    path: string,
    config?: HttpRequestConfig,
  ): Promise<T> {
    const response =
      await fetch(
        `${this.baseUrl}${path}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            ...config?.headers,
          },
          body: JSON.stringify(
            config?.body,
          ),
        },
      );

    return response.json();
  }

  async delete<T>(
    path: string,
  ): Promise<T> {
    const response =
      await fetch(
        `${this.baseUrl}${path}`,
        {
          method: "DELETE",
        },
      );

    return response.json();
  }
}