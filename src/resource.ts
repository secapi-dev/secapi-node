import type { BaseSECClient, DateParam, FormParam, ListParam, QueryParams } from "./http.js";

export type { DateParam, FormParam, ListParam, QueryParams };

export abstract class BaseResource {
  protected readonly client: BaseSECClient;

  constructor(client: BaseSECClient) {
    this.client = client;
  }
}

export function encodePath(value: string): string {
  return encodeURIComponent(value);
}
