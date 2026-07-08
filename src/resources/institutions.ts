import { BaseResource, encodePath } from "../resource.js";
import type {
  Institution,
  InstitutionChangesResponse,
  InstitutionFiling,
  InstitutionFilingPeriodsResponse,
  InstitutionFilingsResponse,
  InstitutionPortfolioCompositionResponse,
  InstitutionProfileResponse,
  InstitutionsActivityResponse,
  InstitutionsHoldingsHistoryResponse,
  InstitutionsHoldingsResponse,
  InstitutionsListResponse,
  InstitutionTradingActivityResponse,
} from "../types.js";

export interface ListInstitutionsParams {
  q?: string;
  limit?: number;
  page?: number;
}

export interface InstitutionProfileParams {
  quarter?: string;
}

export interface InstitutionsActivityParams {
  year?: number;
  quarter?: string;
  limit?: number;
}

export interface InstitutionFilingsParams {
  quarter?: string;
  formType?: string;
  limit?: number;
  page?: number;
}

export interface InstitutionFilingPeriodsParams {
  year?: number;
}

export interface InstitutionHoldingsParams {
  quarter?: string;
  limit?: number;
  sort?: "value" | "shares" | "weight" | string;
}

export interface InstitutionHoldingsHistoryParams extends InstitutionHoldingsParams {
  year?: number;
}

export interface InstitutionChangesParams {
  quarter?: string;
}

export interface InstitutionBuysParams {
  quarter?: string;
  newOnly?: boolean;
  limit?: number;
  page?: number;
}

export interface InstitutionSellsParams {
  quarter?: string;
  soldOutOnly?: boolean;
  limit?: number;
  page?: number;
}

export class Institutions extends BaseResource {
  list(params: ListInstitutionsParams = {}): Promise<InstitutionsListResponse> {
    return this.client.get("/v1/institutions", {
      q: params.q,
      limit: params.limit,
      page: params.page,
    });
  }

  get(cik: string): Promise<Institution> {
    return this.client.get(`/v1/institutions/${encodePath(cik)}`);
  }

  profile(cik: string, params: InstitutionProfileParams = {}): Promise<InstitutionProfileResponse> {
    return this.client.get(`/v1/institutions/${encodePath(cik)}/profile`, {
      quarter: params.quarter,
    });
  }

  activity(params: InstitutionsActivityParams = {}): Promise<InstitutionsActivityResponse> {
    return this.client.get("/v1/institutions/activity", {
      year: params.year,
      quarter: params.quarter,
      limit: params.limit,
    });
  }

  filings(cik: string, params: InstitutionFilingsParams = {}): Promise<InstitutionFilingsResponse> {
    return this.client.get(`/v1/institutions/${encodePath(cik)}/filings`, {
      quarter: params.quarter,
      formType: params.formType,
      limit: params.limit,
      page: params.page,
    });
  }

  filing(cik: string, accessionNumber: string): Promise<InstitutionFiling> {
    return this.client.get(`/v1/institutions/${encodePath(cik)}/filings/${encodePath(accessionNumber)}`);
  }

  filingPeriods(cik: string, params: InstitutionFilingPeriodsParams = {}): Promise<InstitutionFilingPeriodsResponse> {
    return this.client.get(`/v1/institutions/${encodePath(cik)}/filing-periods`, {
      year: params.year,
    });
  }

  holdings(cik: string, params: InstitutionHoldingsParams = {}): Promise<InstitutionsHoldingsResponse> {
    return this.client.get(`/v1/institutions/${encodePath(cik)}/holdings`, {
      quarter: params.quarter,
      limit: params.limit,
      sort: params.sort,
    });
  }

  holdingsHistory(cik: string, params: InstitutionHoldingsHistoryParams = {}): Promise<InstitutionsHoldingsHistoryResponse> {
    return this.client.get(`/v1/institutions/${encodePath(cik)}/holdings/history`, {
      year: params.year,
      quarter: params.quarter,
      limit: params.limit,
      sort: params.sort,
    });
  }

  changes(cik: string, params: InstitutionChangesParams = {}): Promise<InstitutionChangesResponse> {
    return this.client.get(`/v1/institutions/${encodePath(cik)}/changes`, {
      quarter: params.quarter,
    });
  }

  buys(cik: string, params: InstitutionBuysParams = {}): Promise<InstitutionTradingActivityResponse> {
    return this.client.get(`/v1/institutions/${encodePath(cik)}/buys`, {
      quarter: params.quarter,
      newOnly: params.newOnly,
      limit: params.limit,
      page: params.page,
    });
  }

  sells(cik: string, params: InstitutionSellsParams = {}): Promise<InstitutionTradingActivityResponse> {
    return this.client.get(`/v1/institutions/${encodePath(cik)}/sells`, {
      quarter: params.quarter,
      soldOutOnly: params.soldOutOnly,
      limit: params.limit,
      page: params.page,
    });
  }

  sectors(cik: string, params: InstitutionProfileParams = {}): Promise<InstitutionPortfolioCompositionResponse> {
    return this.client.get(`/v1/institutions/${encodePath(cik)}/sectors`, {
      quarter: params.quarter,
    });
  }

  industries(cik: string, params: InstitutionProfileParams = {}): Promise<InstitutionPortfolioCompositionResponse> {
    return this.client.get(`/v1/institutions/${encodePath(cik)}/industries`, {
      quarter: params.quarter,
    });
  }
}
