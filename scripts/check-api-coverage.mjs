#!/usr/bin/env node
// Lists API endpoints that have no method in this SDK, by comparing the paths in
// src/resources/*.ts with the OpenAPI document the API publishes.
//
//   npm run check:coverage
//   SECAPI_OPENAPI_URL=http://localhost:8080/api/core/v3/api-docs npm run check:coverage
//
// Exits 1 when something is missing, so it can gate a release. Until a method exists,
// any endpoint is still reachable with client.get("/v1/...", params).
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OPENAPI_URL = process.env.SECAPI_OPENAPI_URL ?? "https://api.secapi.dev/api/core/v3/api-docs";
const resourcesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "resources");

// "/v1/x/{cik}/y" and "/v1/x/${encodePath(cik)}/y" both become "/v1/x/{}/y".
const normalize = (path) => path.replace(/\$\{[^}]*\}/g, "{}").replace(/\{[^}]*\}/g, "{}");

const sdkPatterns = [];
for (const file of readdirSync(resourcesDir).filter((name) => name.endsWith(".ts"))) {
  const source = readFileSync(join(resourcesDir, file), "utf8").replaceAll(
    "${STATEMENTS_BASE}",
    "/v1/financials/filings",
  );
  for (const match of source.matchAll(/["`](\/v1\/[^"`]*)["`]/g)) {
    // A "{}" segment matches any single path segment (covers `/statements/${kind}`).
    const pattern = normalize(match[1])
      .split("/")
      .map((segment) => (segment === "{}" ? "[^/]+" : segment.replace(/[.*+?^$()|[\]\\]/g, "\\$&")))
      .join("/");
    sdkPatterns.push(new RegExp(`^${pattern}$`));
  }
}

const response = await fetch(OPENAPI_URL, { headers: { Accept: "application/json" } });
if (!response.ok) {
  console.error(`Could not read ${OPENAPI_URL}: HTTP ${response.status}`);
  process.exit(2);
}
const spec = await response.json();

const missing = [];
for (const [path, operations] of Object.entries(spec.paths ?? {})) {
  if (!operations.get) {
    continue;
  }
  const candidate = normalize(path).replaceAll("{}", "x");
  if (!sdkPatterns.some((pattern) => pattern.test(candidate))) {
    missing.push(`${path}  (${operations.get.summary ?? operations.get.operationId ?? "no summary"})`);
  }
}

const total = Object.keys(spec.paths ?? {}).length;
if (missing.length === 0) {
  console.log(`All ${total} API paths have an SDK method.`);
} else {
  console.log(`${missing.length} of ${total} API paths have no SDK method:`);
  for (const line of missing) {
    console.log(`  ${line}`);
  }
  process.exit(1);
}
