# secapi-node - TypeScript SDK for the SEC API

The official TypeScript/Node client for [**secapi.dev**](https://secapi.dev) - SEC filings,
financial statements, standardized metrics & ratios, insider transactions, and
13F institutional holdings from one resource-oriented client.

```ts
import { SECClient } from "secapi-node";

const client = new SECClient({ apiKey: "YOUR_API_KEY" });

const filings = await client.filings.search({ ticker: "AAPL", form: "10-K" });
console.log(filings.data);
```

## Installation

```bash
npm install secapi-node
```

Requires Node.js 18+.

## Authentication

Get an API key from [secapi.dev](https://secapi.dev). Provide it explicitly:

```ts
const client = new SECClient({ apiKey: "YOUR_API_KEY" });
```

Or set an environment variable and omit the option:

```bash
export SECAPI_API_KEY="YOUR_API_KEY"
```

```ts
const client = new SECClient(); // reads SECAPI_API_KEY or SEC_API_KEY
```

## Quickstart

```ts
import { SECClient } from "secapi-node";

const client = new SECClient();

const filings = await client.filings.search({
  ticker: "AAPL",
  form: ["10-K", "8-K"],
  limit: 5,
});

for (const filing of filings.data ?? []) {
  console.log(filing.filingDate, filing.formType, filing.accessionNumber);
}

const income = await client.financials.incomeStatement(undefined, { ticker: "MSFT" });
console.log(income);
```

## Resources

Every top-level API category is a namespace on the client.

### `client.filings`

```ts
await client.filings.search({ ticker: "AAPL", form: ["10-K", "8-K"], startDate: "2025-01-01" });
await client.filings.get("0000320193-26-000006");
await client.filings.retrieve("0000320193", "0000320193-26-000006");
await client.filings.documents("0000320193", "0000320193-26-000006");
await client.filings.formTypes();
```

### `client.financials`

```ts
await client.financials.incomeStatement(undefined, { ticker: "MSFT" });
await client.financials.balanceSheet("0000320193-26-000006");
await client.financials.cashFlow(undefined, { ticker: "AAPL", form: "10-K" });

await client.financials.incomeStatementStandardized(undefined, { ticker: "AAPL" });
await client.financials.xbrl("0000320193-26-000006");
await client.financials.companies({ ticker: "AAPL" });
await client.financials.concepts("revenue");

await client.financials.metrics(["revenue", "net_income"], { ticker: "AAPL" });
await client.financials.ratios({ ticker: "AAPL", group: "profitability" });
await client.financials.topMetrics("revenue", { limit: 10 });
await client.financials.topRatios("gross_margin");

await client.financials.segmentsGeography("AAPL");
await client.financials.segmentsProductService("AAPL", { period: "2024" });
```

### `client.entities`

```ts
await client.entities.get("AAPL");
await client.entities.list({ q: "Apple", limit: 20 });
await client.entities.filings("AAPL", { form: "10-K" });
await client.entities.sicCodes();
```

### `client.insiders`

```ts
await client.insiders.latest({ limit: 50 });
await client.insiders.search({ ticker: "AAPL", acquiredDisposed: "A" });
await client.insiders.transactions({ personCik: "0001214123" });
await client.insiders.buying({ limit: 25 });
await client.insiders.topBuyers();
await client.insiders.owners("AAPL");
await client.insiders.buySellRatio("AAPL");
await client.insiders.person("0001214123");
```

### `client.institutions`

```ts
await client.institutions.list({ q: "Berkshire" });
await client.institutions.holdings("0001067983", { sort: "value" });
await client.institutions.buys("0001067983", { quarter: "2024Q3" });
await client.institutions.sectors("0001067983");
await client.institutions.activity();
```

## Error handling

```ts
import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  SECClient,
  SecApiError,
} from "secapi-node";

const client = new SECClient();

try {
  await client.entities.get("AAPL");
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error("Slow down:", error.apiMessage);
  } else if (error instanceof AuthenticationError) {
    console.error("Check your API key");
  } else if (error instanceof NotFoundError) {
    console.error("No such entity");
  } else if (error instanceof SecApiError) {
    console.error("Request failed:", error.message);
  }
}
```

`APIStatusError` exposes `statusCode`, `code`, `apiMessage`, `details`, `requestId`, and `body`.

## Configuration

```ts
const client = new SECClient({
  apiKey: "...",
  baseUrl: "https://api.secapi.dev",
  timeoutMs: 30_000,
  maxRetries: 2,
  defaultHeaders: { "X-App": "my-app" },
});
```

The SDK uses Node 18+ native `fetch`. Pass a custom `fetch` implementation in tests or specialized runtimes.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

This initial TypeScript SDK mirrors the public method surface of `secapi-python`. Response
types are intentionally forward-compatible object types; the next step is to generate
precise response models from `https://api.secapi.dev/api/core/v3/api-docs`.
