import { describe, expect, it } from "vitest";
import { SECClient } from "../src/index.js";

type CapturedRequest = {
  input: string | URL | Request;
  init?: RequestInit | undefined;
};

function makeClient() {
  const calls: CapturedRequest[] = [];
  const fetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    calls.push({ input, init });
    return new Response(JSON.stringify({ data: [], pagination: { page: 1, limit: 20, hasMoreData: false } }), {
      headers: { "Content-Type": "application/json" },
    });
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

function params(url: URL): Record<string, string> {
  return Object.fromEntries(url.searchParams.entries());
}

describe("resource URL mapping", () => {
  it("builds entity filings params", async () => {
    const { client, calls } = makeClient();

    await client.entities.filings("AAPL", { form: "10-K", startDate: "2025-01-01", limit: 5 });

    const url = lastUrl(calls);
    expect(url.pathname).toBe("/v1/entities/AAPL/filings");
    expect(params(url)).toEqual({ formTypes: "10-K", startDate: "2025-01-01", page: "1", limit: "5" });
  });

  it("builds financial company search params", async () => {
    const { client, calls } = makeClient();

    await client.financials.companies({ ticker: "AAPL" });

    const url = lastUrl(calls);
    expect(url.pathname).toBe("/v1/financials/companies/search");
    expect(params(url)).toEqual({ ticker: "AAPL", limit: "25", page: "1" });
  });

  it("joins financial metric symbols", async () => {
    const { client, calls } = makeClient();

    await client.financials.metrics(["revenue", "net_income"], { ticker: "AAPL", qtrs: 4 });

    const url = lastUrl(calls);
    expect(url.pathname).toBe("/v1/financials/metrics");
    expect(params(url)).toMatchObject({
      symbols: "revenue,net_income",
      ticker: "AAPL",
      source: "all",
      qtrs: "4",
    });
  });

  it("builds statement paths by accession", async () => {
    const { client, calls } = makeClient();

    await client.financials.balanceSheet("0000320193-26-000006");

    expect(lastUrl(calls).pathname).toBe("/v1/financials/filings/0000320193-26-000006/statements/balance-sheet");
  });

  it("routes insider transactions by scope", async () => {
    const { client, calls } = makeClient();

    await client.insiders.transactions();
    expect(lastUrl(calls).pathname).toBe("/v1/insiders/transactions");

    await client.insiders.transactions({ ticker: "AAPL", minValue: 100000 });
    expect(lastUrl(calls).pathname).toBe("/v1/insiders/AAPL/transactions");
    expect(lastUrl(calls).searchParams.get("minValue")).toBe("100000");

    await client.insiders.transactions({ personCik: "0001214123" });
    expect(lastUrl(calls).pathname).toBe("/v1/insiders/person/0001214123/transactions");
  });

  it("uses from/end params for insider activity", async () => {
    const { client, calls } = makeClient();

    await client.insiders.buying({ limit: 10, start: "2024-01-01", end: "2024-03-31" });

    const url = lastUrl(calls);
    expect(url.pathname).toBe("/v1/insiders/activity/buying");
    expect(params(url)).toEqual({ limit: "10", from: "2024-01-01", end: "2024-03-31" });
  });

  it("builds institution holdings and buys params", async () => {
    const { client, calls } = makeClient();

    await client.institutions.holdings("0001067983", { sort: "value", limit: 10 });
    let url = lastUrl(calls);
    expect(url.pathname).toBe("/v1/institutions/0001067983/holdings");
    expect(params(url)).toEqual({ limit: "10", sort: "value" });

    await client.institutions.buys("0001067983", { quarter: "2024Q3", newOnly: true });
    url = lastUrl(calls);
    expect(url.pathname).toBe("/v1/institutions/0001067983/buys");
    expect(params(url)).toEqual({ quarter: "2024Q3", newOnly: "true" });
  });

  it("search is an alias for insider transactions", async () => {
    const { client, calls } = makeClient();

    await client.insiders.search({ ticker: "AAPL" });

    expect(lastUrl(calls).pathname).toBe("/v1/insiders/AAPL/transactions");
  });
});
