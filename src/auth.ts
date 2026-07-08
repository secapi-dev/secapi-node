export const API_KEY_HEADER = "x-api-key";

export const ENV_VARS = ["SECAPI_API_KEY", "SEC_API_KEY"] as const;

export class MissingApiKeyError extends Error {
  constructor() {
    super(
      "No API key provided. Pass apiKey to SECClient, or set the SECAPI_API_KEY environment variable. Get a key at https://secapi.dev.",
    );
    this.name = "MissingApiKeyError";
  }
}

export function resolveApiKey(explicit?: string): string {
  if (explicit?.trim()) {
    return explicit.trim();
  }

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar];
    if (value?.trim()) {
      return value.trim();
    }
  }

  throw new MissingApiKeyError();
}

export function authHeaders(apiKey: string): Record<string, string> {
  return { [API_KEY_HEADER]: apiKey };
}
