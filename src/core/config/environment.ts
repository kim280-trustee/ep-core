export const environment = {
  apiUrl:
    import.meta.env.VITE_API_URL ??
    "http://localhost:3000/api",

  isProduction:
    import.meta.env.PROD,

  isDevelopment:
    import.meta.env.DEV,
};