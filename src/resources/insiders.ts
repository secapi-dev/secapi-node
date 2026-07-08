import { BaseResource, encodePath, type DateParam } from "../resource.js";
import type {
  InsiderBuySellRatioResponse,
  InsiderCompaniesResponse,
  InsiderDailyActivityResponse,
  InsiderHoldingsResponse,
  InsiderHoldingsSummaryResponse,
  InsiderNetSharesResponse,
  InsiderNetValueResponse,
  InsiderOwnersResponse,
  InsiderPerson,
  InsiderPersonsResponse,
  InsiderStatisticsResponse,
  InsiderTransactionsResponse,
} from "../types.js";

export interface InsiderTransactionsParams {
  ticker?: string;
  personCik?: string;
  acquiredDisposed?: "A" | "D" | string;
  transactionCode?: string;
  derivative?: boolean;
  insiderRole?: string;
  minValue?: number;
  limit?: number;
  acceptedFrom?: DateParam;
  transactionFrom?: DateParam;
}

export interface InsiderActivityParams {
  limit?: number;
  start?: DateParam;
  end?: DateParam;
}

export interface InsiderDailyActivityParams {
  date?: DateParam;
  limit?: number;
}

export interface InsiderDirectoryParams {
  q?: string;
  limit?: number;
  page?: number;
}

export interface InsiderOwnersParams {
  includeDerivative?: boolean;
  includeNonDerivative?: boolean;
  activeSince?: DateParam;
  limit?: number;
}

export interface PersonHoldingsSummaryParams {
  includeDerivative?: boolean;
  includeNonDerivative?: boolean;
}

export class Insiders extends BaseResource {
  transactions(params: InsiderTransactionsParams = {}): Promise<InsiderTransactionsResponse> {
    const baseParams = {
      acquiredDisposed: params.acquiredDisposed,
      transactionCode: params.transactionCode,
      limit: params.limit,
      acceptedFrom: params.acceptedFrom,
      transactionFrom: params.transactionFrom,
    };

    if (params.personCik) {
      return this.client.get(`/v1/insiders/person/${encodePath(params.personCik)}/transactions`, baseParams);
    }

    const query = {
      ...baseParams,
      derivative: params.derivative,
      insiderRole: params.insiderRole,
      minValue: params.minValue,
    };

    if (params.ticker) {
      return this.client.get(`/v1/insiders/${encodePath(params.ticker)}/transactions`, query);
    }

    return this.client.get("/v1/insiders/transactions", query);
  }

  search(params: InsiderTransactionsParams = {}): Promise<InsiderTransactionsResponse> {
    return this.transactions(params);
  }

  latest(params: { ticker?: string; limit?: number } = {}): Promise<InsiderTransactionsResponse> {
    return this.transactions(params);
  }

  buying(params: InsiderActivityParams = {}): Promise<InsiderTransactionsResponse> {
    return this.client.get("/v1/insiders/activity/buying", {
      limit: params.limit,
      from: params.start,
      end: params.end,
    });
  }

  selling(params: InsiderActivityParams = {}): Promise<InsiderTransactionsResponse> {
    return this.client.get("/v1/insiders/activity/selling", {
      limit: params.limit,
      from: params.start,
      end: params.end,
    });
  }

  topBuyers(params: InsiderDailyActivityParams = {}): Promise<InsiderDailyActivityResponse> {
    return this.client.get("/v1/insiders/activity/daily/top-buyers", {
      date: params.date,
      limit: params.limit,
    });
  }

  topSellers(params: InsiderDailyActivityParams = {}): Promise<InsiderDailyActivityResponse> {
    return this.client.get("/v1/insiders/activity/daily/top-sellers", {
      date: params.date,
      limit: params.limit,
    });
  }

  statistics(): Promise<InsiderStatisticsResponse> {
    return this.client.get("/v1/insiders/statistics");
  }

  companies(params: InsiderDirectoryParams = {}): Promise<InsiderCompaniesResponse> {
    return this.client.get("/v1/insiders/companies", {
      q: params.q,
      limit: params.limit,
      page: params.page,
    });
  }

  persons(params: InsiderDirectoryParams = {}): Promise<InsiderPersonsResponse> {
    return this.client.get("/v1/insiders/persons", {
      q: params.q,
      limit: params.limit,
      page: params.page,
    });
  }

  owners(ticker: string, params: InsiderOwnersParams = {}): Promise<InsiderOwnersResponse> {
    return this.client.get(`/v1/insiders/${encodePath(ticker)}/owners`, {
      includeDerivative: params.includeDerivative ?? false,
      includeNonDerivative: params.includeNonDerivative ?? true,
      activeSince: params.activeSince,
      limit: params.limit,
    });
  }

  buySellRatio(ticker: string): Promise<InsiderBuySellRatioResponse> {
    return this.client.get(`/v1/insiders/${encodePath(ticker)}/buy-sell-ratio`);
  }

  netShares(ticker: string): Promise<InsiderNetSharesResponse> {
    return this.client.get(`/v1/insiders/${encodePath(ticker)}/net-shares`);
  }

  netValue(ticker: string): Promise<InsiderNetValueResponse> {
    return this.client.get(`/v1/insiders/${encodePath(ticker)}/net-value`);
  }

  person(cik: string): Promise<InsiderPerson> {
    return this.client.get(`/v1/insiders/person/${encodePath(cik)}`);
  }

  personTransactions(
    cik: string,
    params: Omit<InsiderTransactionsParams, "ticker" | "personCik" | "derivative" | "insiderRole" | "minValue"> = {},
  ): Promise<InsiderTransactionsResponse> {
    const query: InsiderTransactionsParams = { personCik: cik };
    if (params.acquiredDisposed) {
      query.acquiredDisposed = params.acquiredDisposed;
    }
    if (params.transactionCode) {
      query.transactionCode = params.transactionCode;
    }
    if (params.limit !== undefined) {
      query.limit = params.limit;
    }
    if (params.acceptedFrom !== undefined) {
      query.acceptedFrom = params.acceptedFrom;
    }
    if (params.transactionFrom !== undefined) {
      query.transactionFrom = params.transactionFrom;
    }
    return this.transactions(query);
  }

  personHoldings(cik: string): Promise<InsiderHoldingsResponse> {
    return this.client.get(`/v1/insiders/person/${encodePath(cik)}/holdings`);
  }

  personHoldingsSummary(cik: string, params: PersonHoldingsSummaryParams = {}): Promise<InsiderHoldingsSummaryResponse> {
    return this.client.get(`/v1/insiders/person/${encodePath(cik)}/holdings/summary`, {
      includeDerivative: params.includeDerivative ?? true,
      includeNonDerivative: params.includeNonDerivative ?? true,
    });
  }

  personOwnership(cik: string): Promise<InsiderHoldingsResponse> {
    return this.client.get(`/v1/insiders/person/${encodePath(cik)}/ownership`);
  }
}
