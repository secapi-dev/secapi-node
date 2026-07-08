import { BaseResource, encodePath, type DateParam, type ListParam } from "../resource.js";
import type {
  CanonicalBalanceSheet,
  CanonicalCashFlow,
  CanonicalIncomeStatement,
  CompaniesSearchResponse,
  CompanyFinancialStatement,
  ConceptsListResponse,
  FinancialMetricRankingResponse,
  FinancialMetricSeriesResponse,
  FinancialRatioRankingResponse,
  FinancialRatioSeriesResponse,
  FinancialSegmentResponse,
  FinancialXbrl,
  SecApiObject,
} from "../types.js";

const STATEMENTS_BASE = "/v1/financials/filings";

export interface SearchFinancialCompaniesParams {
  ticker?: string;
  cik?: string;
  limit?: number;
  page?: number;
}

export interface SearchConceptsParams {
  version?: string;
  custom?: boolean;
  limit?: number;
  page?: number;
}

export interface StatementLookupParams {
  ticker?: string;
  cik?: string;
  form?: string;
}

export interface XbrlParams extends StatementLookupParams {
  roleUri?: string;
}

export interface StandardizedStatementParams extends StatementLookupParams {
  endDate?: number;
  qtrs?: number;
}

export interface MetricsParams {
  ticker?: string;
  cik?: string;
  source?: "raw" | "canonical" | "all" | string;
  version?: string;
  startDate?: DateParam;
  endDate?: DateParam;
  qtrs?: number;
  limit?: number;
}

export interface TopMetricsParams {
  quarterly?: boolean;
  year?: number;
  quarter?: number;
  limit?: number;
}

export interface RatiosParams {
  ticker?: string;
  cik?: string;
  ratio?: ListParam;
  group?: string;
  startDate?: DateParam;
  endDate?: DateParam;
  qtrs?: number;
  limit?: number;
}

export interface TopRatiosParams {
  group?: string;
  startDate?: DateParam;
  endDate?: DateParam;
  qtrs?: number;
  limit?: number;
}

export interface SegmentsParams {
  metric?: string;
  axis?: string;
  segmentType?: string;
  period?: string;
  qtrs?: number;
  accessionNumber?: string;
  limit?: number;
}

export interface SegmentCompareParams {
  metric?: string;
  axis?: string;
  segmentType?: string;
  periods?: ListParam;
  qtrs?: number;
  limit?: number;
}

export class Financials extends BaseResource {
  companies(params: SearchFinancialCompaniesParams = {}): Promise<CompaniesSearchResponse> {
    return this.client.get("/v1/financials/companies/search", {
      ticker: params.ticker,
      cik: params.cik,
      limit: params.limit ?? 25,
      page: params.page ?? 1,
    });
  }

  concepts(q: string, params: SearchConceptsParams = {}): Promise<ConceptsListResponse> {
    return this.client.get("/v1/financials/concepts/search", {
      q,
      version: params.version,
      custom: params.custom,
      limit: params.limit ?? 50,
      page: params.page ?? 1,
    });
  }

  async incomeStatement(
    accessionNumber?: string,
    params: StatementLookupParams = {},
  ): Promise<CompanyFinancialStatement> {
    const accession = await this.requireAccession(accessionNumber, params);
    return this.statement(accession, "income-statement");
  }

  async balanceSheet(accessionNumber?: string, params: StatementLookupParams = {}): Promise<CompanyFinancialStatement> {
    const accession = await this.requireAccession(accessionNumber, params);
    return this.statement(accession, "balance-sheet");
  }

  async cashFlow(accessionNumber?: string, params: StatementLookupParams = {}): Promise<CompanyFinancialStatement> {
    const accession = await this.requireAccession(accessionNumber, params);
    return this.statement(accession, "cash-flow");
  }

  async stockholdersEquity(
    accessionNumber?: string,
    params: StatementLookupParams = {},
  ): Promise<CompanyFinancialStatement> {
    const accession = await this.requireAccession(accessionNumber, params);
    return this.statement(accession, "stockholders-equity");
  }

  async comprehensiveIncome(
    accessionNumber?: string,
    params: StatementLookupParams = {},
  ): Promise<CompanyFinancialStatement> {
    const accession = await this.requireAccession(accessionNumber, params);
    return this.statement(accession, "comprehensive-income");
  }

  async xbrl(accessionNumber?: string, params: XbrlParams = {}): Promise<FinancialXbrl> {
    const accession = await this.requireAccession(accessionNumber, params);
    return this.client.get(`/v1/financials/filings/${encodePath(accession)}/xbrl`, {
      roleUri: params.roleUri,
    });
  }

  async incomeStatementStandardized(
    accessionNumber?: string,
    params: StandardizedStatementParams = {},
  ): Promise<CanonicalIncomeStatement> {
    const accession = await this.requireAccession(accessionNumber, params);
    return this.client.get(`${STATEMENTS_BASE}/${encodePath(accession)}/statements/income-statement/standardized`, {
      endDate: params.endDate,
      qtrs: params.qtrs,
    });
  }

  async balanceSheetStandardized(
    accessionNumber?: string,
    params: StandardizedStatementParams = {},
  ): Promise<CanonicalBalanceSheet> {
    const accession = await this.requireAccession(accessionNumber, params);
    return this.client.get(`${STATEMENTS_BASE}/${encodePath(accession)}/statements/balance-sheet/standardized`, {
      endDate: params.endDate,
    });
  }

  async cashFlowStandardized(
    accessionNumber?: string,
    params: StandardizedStatementParams = {},
  ): Promise<CanonicalCashFlow> {
    const accession = await this.requireAccession(accessionNumber, params);
    return this.client.get(`${STATEMENTS_BASE}/${encodePath(accession)}/statements/cash-flow/standardized`, {
      endDate: params.endDate,
      qtrs: params.qtrs,
    });
  }

  metrics(symbols: ListParam, params: MetricsParams = {}): Promise<FinancialMetricSeriesResponse> {
    return this.client.get("/v1/financials/metrics", {
      ticker: params.ticker,
      cik: params.cik,
      symbols,
      source: params.source ?? "all",
      version: params.version,
      startDate: params.startDate,
      endDate: params.endDate,
      qtrs: params.qtrs,
      limit: params.limit,
    });
  }

  topMetrics(metric: string, params: TopMetricsParams = {}): Promise<FinancialMetricRankingResponse> {
    return this.client.get("/v1/financials/metrics/top", {
      metric,
      quarterly: params.quarterly,
      year: params.year,
      quarter: params.quarter,
      limit: params.limit,
    });
  }

  ratios(params: RatiosParams = {}): Promise<FinancialRatioSeriesResponse> {
    return this.client.get("/v1/financials/ratios", {
      ticker: params.ticker,
      cik: params.cik,
      ratio: params.ratio,
      group: params.group,
      startDate: params.startDate,
      endDate: params.endDate,
      qtrs: params.qtrs,
      limit: params.limit,
    });
  }

  topRatios(ratio: string, params: TopRatiosParams = {}): Promise<FinancialRatioRankingResponse> {
    return this.client.get("/v1/financials/ratios/top", {
      ratio,
      group: params.group,
      startDate: params.startDate,
      endDate: params.endDate,
      qtrs: params.qtrs,
      limit: params.limit,
    });
  }

  segments(issuer: string, params: SegmentsParams = {}): Promise<FinancialSegmentResponse> {
    return this.client.get(`/v1/financials/${encodePath(issuer)}/segments`, {
      metric: params.metric,
      axis: params.axis,
      segmentType: params.segmentType,
      period: params.period,
      qtrs: params.qtrs,
      accessionNumber: params.accessionNumber,
      limit: params.limit,
    });
  }

  segmentsGeography(issuer: string, params: Omit<SegmentsParams, "segmentType"> = {}): Promise<FinancialSegmentResponse> {
    return this.client.get(`/v1/financials/${encodePath(issuer)}/segments/geography`, {
      metric: params.metric,
      axis: params.axis,
      period: params.period,
      qtrs: params.qtrs,
      accessionNumber: params.accessionNumber,
      limit: params.limit,
    });
  }

  segmentsProductService(
    issuer: string,
    params: Omit<SegmentsParams, "segmentType"> = {},
  ): Promise<FinancialSegmentResponse> {
    return this.client.get(`/v1/financials/${encodePath(issuer)}/segments/product-service`, {
      metric: params.metric,
      axis: params.axis,
      period: params.period,
      qtrs: params.qtrs,
      accessionNumber: params.accessionNumber,
      limit: params.limit,
    });
  }

  segmentsCompare(issuer: string, params: SegmentCompareParams = {}): Promise<FinancialSegmentResponse> {
    return this.client.get(`/v1/financials/${encodePath(issuer)}/segments/compare`, {
      metric: params.metric,
      axis: params.axis,
      segmentType: params.segmentType,
      periods: params.periods,
      qtrs: params.qtrs,
      limit: params.limit,
    });
  }

  segmentsGeographyCompare(
    issuer: string,
    params: Omit<SegmentCompareParams, "segmentType"> = {},
  ): Promise<FinancialSegmentResponse> {
    return this.client.get(`/v1/financials/${encodePath(issuer)}/segments/geography/compare`, {
      metric: params.metric,
      axis: params.axis,
      periods: params.periods,
      qtrs: params.qtrs,
      limit: params.limit,
    });
  }

  segmentsProductServiceCompare(
    issuer: string,
    params: Omit<SegmentCompareParams, "segmentType"> = {},
  ): Promise<FinancialSegmentResponse> {
    return this.client.get(`/v1/financials/${encodePath(issuer)}/segments/product-service/compare`, {
      metric: params.metric,
      axis: params.axis,
      periods: params.periods,
      qtrs: params.qtrs,
      limit: params.limit,
    });
  }

  private statement(accession: string, kind: string): Promise<CompanyFinancialStatement> {
    return this.client.get(`${STATEMENTS_BASE}/${encodePath(accession)}/statements/${kind}`);
  }

  private async requireAccession(accessionNumber: string | undefined, params: StatementLookupParams): Promise<string> {
    if (accessionNumber) {
      return accessionNumber;
    }
    if (params.ticker || params.cik) {
      return this.resolveLatestAccession(params);
    }
    throw new TypeError("Provide an accessionNumber, or ticker/cik to resolve the latest filing.");
  }

  private async resolveLatestAccession(params: StatementLookupParams): Promise<string> {
    const lookup: SearchFinancialCompaniesParams = { limit: 100 };
    if (params.ticker) {
      lookup.ticker = params.ticker;
    }
    if (params.cik) {
      lookup.cik = params.cik;
    }
    const response = await this.companies(lookup);
    const filings = extractFilings(response);
    const wantedForm = params.form?.toUpperCase();
    const filtered = wantedForm
      ? filings.filter((filing) => getString(filing, "form", "formType")?.toUpperCase() === wantedForm)
      : filings;
    const candidates = filtered.length > 0 ? filtered : filings;

    candidates.sort((a, b) => getDateMs(b) - getDateMs(a));

    for (const filing of candidates) {
      const accession = getString(filing, "accessionNumber", "accession_number");
      if (accession) {
        return accession;
      }
    }

    const who = params.ticker ?? params.cik ?? "company";
    throw new Error(`Could not find a filing to resolve a statement for ${who}. Pass an explicit accessionNumber instead.`);
  }
}

function extractFilings(response: CompaniesSearchResponse): SecApiObject[] {
  const filings = response.filings;
  if (Array.isArray(filings)) {
    return filings.filter(isSecApiObject);
  }
  const data = response.data;
  if (Array.isArray(data)) {
    return data.filter(isSecApiObject);
  }
  return [];
}

function isSecApiObject(value: unknown): value is SecApiObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(obj: SecApiObject, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

function getDateMs(obj: SecApiObject): number {
  const value = getString(obj, "filed", "filingDate", "filing_date");
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}
