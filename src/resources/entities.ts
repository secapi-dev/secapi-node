import { BaseResource, encodePath, type DateParam, type FormParam } from "../resource.js";
import type { EntitiesListResponse, Entity, EntitySicListResponse, FilingsListResponse } from "../types.js";

export interface ListEntitiesParams {
  ticker?: string;
  cik?: string;
  entityType?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface EntityFilingsParams {
  form?: FormParam;
  startDate?: DateParam;
  endDate?: DateParam;
  page?: number;
  limit?: number;
}

export interface ListSicCodesParams {
  page?: number;
  limit?: number;
}

export class Entities extends BaseResource {
  list(params: ListEntitiesParams = {}): Promise<EntitiesListResponse> {
    return this.client.get("/v1/entities", {
      ticker: params.ticker,
      cik: params.cik,
      entityType: params.entityType,
      q: params.q,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
  }

  get(identifier: string): Promise<Entity> {
    return this.client.get(`/v1/entities/${encodePath(identifier)}`);
  }

  filings(identifier: string, params: EntityFilingsParams = {}): Promise<FilingsListResponse> {
    return this.client.get(`/v1/entities/${encodePath(identifier)}/filings`, {
      formTypes: params.form,
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
  }

  sicCodes(params: ListSicCodesParams = {}): Promise<EntitySicListResponse> {
    return this.client.get("/v1/entities/sic-codes", {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
  }
}
