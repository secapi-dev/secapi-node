import { SECClient } from "../src/index.js";

const client = new SECClient();

const filings = await client.filings.search({
  ticker: "AAPL",
  form: "10-K",
  limit: 5,
});

for (const filing of filings.data ?? []) {
  console.log(filing.filingDate, filing.formType, filing.accessionNumber);
}
