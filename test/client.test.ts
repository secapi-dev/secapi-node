import { afterEach, describe, expect, it } from "vitest";
import {
  AuthenticationError,
  BadRequestError,
  MissingApiKeyError,
  NotFoundError,
  PermissionDeniedError,
  RateLimitError,
  SECClient,
  ServerError,
  ValidationError,
} from "../src/index.js";

type CapturedRequest = {
  input: string | URL | Request;
  init?: RequestInit | undefined;
};

function jsonResponse(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function makeClient(handler?: (request: CapturedRequest) => Response | Promise<Response>) {
  const calls: CapturedRequest[] = [];
  const fetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const request = { input, init };
    calls.push(request);
    return handler?.(request) ?? jsonResponse({ data: [], pagination: { page: 1, limit: 20, hasMoreData: false } });
  };

  return {
    client: new SECClient({ apiKey: "test_api_key", fetch, maxRetries: 0 }),
    calls,
  };
}

function lastUrl(calls: CapturedRequest[]): URL {
  const input = calls.at(-1)?.input;
  if (!input) {
    throw new Error("No request captured");
  }
  return input instanceof Request ? new URL(input.url) : new URL(input);
}

afterEach(() => {
  delete process.env.SECAPI_API_KEY;
  delete process.env.SEC_API_KEY;
});

describe("SECClient", () => {
  it("requires an API key when no env var is set", () => {
    expect(() => new SECClient({ fetch: async () => jsonResponse({}) })).toThrow(MissingApiKeyError);
  });

  it("reads the API key from SECAPI_API_KEY", () => {
    process.env.SECAPI_API_KEY = "from_env";
    const client = new SECClient({ fetch: async () => jsonResponse({}) });

    expect(client.apiKey).toBe("from_env");
  });

  it("sends auth and user-agent headers", async () => {
    const { client, calls } = makeClient();

    await client.entities.list();

    expect(calls.at(-1)?.init?.headers).toMatchObject({
      "x-api-key": "test_api_key",
      "User-Agent": "secapi-node/0.1.0",
    });
  });

  it("serializes query params like the API expects", async () => {
    const { client, calls } = makeClient();

    await client.filings.search({
      ticker: "AAPL",
      form: ["10-K", "8-K"],
      startDate: new Date("2025-01-01T00:00:00.000Z"),
      page: 2,
    });

    const params = lastUrl(calls).searchParams;
    expect(params.get("ticker")).toBe("AAPL");
    expect(params.get("formTypes")).toBe("10-K,8-K");
    expect(params.get("startDate")).toBe("2025-01-01");
    expect(params.get("page")).toBe("2");
    expect(params.has("cik")).toBe(false);
  });

  it("serializes booleans", async () => {
    const { client, calls } = makeClient();

    await client.insiders.owners("AAPL", { includeDerivative: true, includeNonDerivative: false });

    const params = lastUrl(calls).searchParams;
    expect(params.get("includeDerivative")).toBe("true");
    expect(params.get("includeNonDerivative")).toBe("false");
  });

  it.each([
    [400, BadRequestError],
    [401, AuthenticationError],
    [403, PermissionDeniedError],
    [404, NotFoundError],
    [429, RateLimitError],
    [500, ServerError],
    [503, ServerError],
  ])("maps status %s to a typed error", async (status, ErrorClass) => {
    const body = { error: { code: "x", message: "boom", details: { reason: "y" }, request_id: "req-123" } };
    const { client } = makeClient(() => jsonResponse(body, status));

    await expect(client.entities.get("AAPL")).rejects.toMatchObject({
      name: ErrorClass.name,
      statusCode: status,
      apiMessage: "boom",
      requestId: "req-123",
      details: { reason: "y" },
    });
  });

  it("aliases ValidationError to BadRequestError", () => {
    expect(ValidationError).toBe(BadRequestError);
  });
});
