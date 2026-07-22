interface EnvironmentConfig {
  mode: string;
  apiUrl: string;
}

function getEnvValue(
  key: keyof ImportMetaEnv,
  fallback = "",
): string {
  return import.meta.env[key] ?? fallback;
}

export const env: EnvironmentConfig = {
  mode: getEnvValue(
    "MODE",
    "development",
  ),

  apiUrl: getEnvValue(
    "VITE_API_URL",
    "http://localhost:3000",
  ),
};