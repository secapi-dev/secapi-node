import { SECClient } from "../src/index.js";

const client = new SECClient();

const income = await client.financials.incomeStatement(undefined, {
  ticker: "MSFT",
  form: "10-K",
});

console.log(income);

const metrics = await client.financials.metrics(["revenue", "net_income"], {
  ticker: "MSFT",
  qtrs: 4,
});

console.log(metrics);
