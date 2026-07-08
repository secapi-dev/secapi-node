import { SECClient } from "../src/index.js";

const client = new SECClient();

const trades = await client.insiders.search({
  ticker: "AAPL",
  acquiredDisposed: "A",
  limit: 25,
});

console.log(trades);
