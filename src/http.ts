import { authHeaders, resolveApiKey } from "./auth.js";
import { APIConnectionError, APITimeoutError, makeStatusError } from "./errors.js";
import { VERSION } from "./version.js";

export const DEFAULT_BASE_URL = "https://api.secapi.dev";
export const DEFAULT_TIMEOUT_MS = 30_000;
export const DEFAULT_MAX_RETRIES = 2;
export const RETRY_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

export type DateParam = string | Date;
export type ListParam = string | readonly string[];
export type FormParam = string | readonly string[];
export type QueryValue = string | number | boolean | Date | null | undefined | readonly (string | number | boolean | Date | null | undefined)[];
export type QueryParams = Record<string, QueryValue>;

export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export interface SECClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
  defaultHeaders?: HeadersInit;
  fetch?: FetchLike;
}

export interface RequestOptions {
  params?: QueryParams | undefined;
}

export function serializeScalar(value: Exclude<QueryValue, readonly unknown[] | null | undefined>): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

export function buildQuery(params?: QueryParams): URLSearchParams {
  const query = new URLSearchParams();
  if (!params) {
    return query;
  }

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      const items = value
        .filter((item): item is Exclude<typeof item, null | undefined> => item !== null && item !== undefined)
        .map((item) => serializeScalar(item));
      if (items.length > 0) {
        query.set(key, items.join(","));
      }
      continue;
    }

    query.set(key, serializeScalar(value as Exclude<QueryValue, readonly unknown[] | null | undefined>));
  }

  return query;
}

async function safeJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function headersToRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) {
    return {};
  }
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...headers };
}

function retryDelayMs(attempt: number, response?: Response): number {
  const retryAfter = response?.headers.get("Retry-After");
  if (retryAfter) {
    const parsed = Number(retryAfter);
    if (Number.isFinite(parsed)) {
      return Math.min(parsed * 1000, 60_000);
    }
  }

  const backoff = Math.min(500 * 2 ** attempt, 8_000);
  return backoff + Math.floor(Math.random() * 250);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export class BaseSECClient {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly headers: Record<string, string>;

  private readonly fetchImpl: FetchLike;

  constructor(options: SECClientOptions = {}) {
    this.apiKey = resolveApiKey(options.apiKey);
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = Math.max(0, Math.trunc(options.maxRetries ?? DEFAULT_MAX_RETRIES));
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.headers = {
      Accept: "application/json",
      "User-Agent": `secapi-node/${VERSION}`,
      ...authHeaders(this.apiKey),
      ...headersToRecord(options.defaultHeaders),
    };
  }

  async close(): Promise<void> {
    // Native fetch does not expose a connection pool to close.
  }

  async get<T = unknown>(path: string, params?: QueryParams): Promise<T> {
    return this.request<T>("GET", path, { params });
  }

  async request<T = unknown>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
    const query = buildQuery(options.params);
    query.forEach((value, key) => url.searchParams.set(key, value));

    let response: Response | undefined;
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        response = await this.fetchImpl(url, {
          method,
          headers: this.headers,
          signal: controller.signal,
        });

        const retryable = RETRY_STATUS_CODES.has(response.status);
        if (!retryable || attempt >= this.maxRetries) {
          return this.processResponse<T>(response);
        }
      } catch (error) {
        lastError = error;
        if (attempt >= this.maxRetries) {
          if (isAbortError(error)) {
            throw new APITimeoutError(undefined, { cause: error });
          }
          throw new APIConnectionError(undefined, { cause: error instanceof Error ? error : undefined });
        }
      } finally {
        clearTimeout(timeout);
      }

      await sleep(retryDelayMs(attempt, response));
    }

    if (lastError) {
      throw new APIConnectionError(undefined, { cause: lastError instanceof Error ? lastError : undefined });
    }
    throw new APIConnectionError();
  }

  private async processResponse<T>(response: Response): Promise<T> {
    const body = await safeJson(response);
    if (response.status >= 400) {
      throw makeStatusError(response.status, body, response.headers.get("X-Request-Id"));
    }
    return body as T;
  }
}
