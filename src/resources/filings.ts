import { BaseResource, encodePath, type DateParam, type FormParam } from "../resource.js";
import type { Filing, FilingDocument, FilingFormTypesListResponse, FilingsListResponse } from "../types.js";

export interface SearchFilingsParams {
  ticker?: string;
  cik?: string;
  form?: FormParam;
  startDate?: DateParam;
  endDate?: DateParam;
  page?: number;
  limit?: number;
}

export interface ListFormTypesParams {
  page?: number;
  limit?: number;
}

export class Filings extends BaseResource {
  search(params: SearchFilingsParams = {}): Promise<FilingsListResponse> {
    return this.client.get("/v1/filings", {
      ticker: params.ticker,
      cik: params.cik,
      formTypes: params.form,
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
  }

  get(accessionNumber: string): Promise<Filing[]> {
    return this.client.get(`/v1/filings/${encodePath(accessionNumber)}`);
  }

  retrieve(cik: string, accessionNumber: string): Promise<Filing> {
    return this.client.get(`/v1/filings/${encodePath(cik)}/${encodePath(accessionNumber)}`);
  }

  documents(cik: string, accessionNumber: string): Promise<FilingDocument[]> {
    return this.client.get(`/v1/filings/${encodePath(cik)}/${encodePath(accessionNumber)}/documents`);
  }

  formTypes(params: ListFormTypesParams = {}): Promise<FilingFormTypesListResponse> {
    return this.client.get("/v1/filings/form-types", {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
  }
}
