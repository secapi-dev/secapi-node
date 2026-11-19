import { BaseResource, encodePath, type DateParam, type ListParam } from "../resource.js";
import type {
  CanonicalBalanceSheet,
  CanonicalCashFlow,
  CanonicalIncomeStatement,
  CompaniesSearchResponse,
  CompanyFinancialFilingsResponse,
  CompanyFinancialStatement,
  CompanyLatestFinancialsResponse,
  CompanyStandardizedStatementsResponse,
  ConceptsListResponse,
  FinancialMetricRankingResponse,
  FinancialMetricSeriesResponse,
  FinancialRatioRankingResponse,
  FinancialRatioSeriesResponse,
  FinancialSegmentResponse,
  FinancialXbrl,
  SecApiObject,
  SharesOutstandingResponse,
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

/** Statements available as filed ("as reported"). */
export type StatementKind =
  | "income-statement"
  | "balance-sheet"
  | "cash-flow"
  | "stockholders-equity"
  | "comprehensive-income";

/** Statements available in the standardized (comparable across companies) form. */
export type StandardizedStatementKind = "income-statement" | "balance-sheet" | "cash-flow";

export interface CompanyFilingsParams {
  limit?: number;
  page?: number;
}

export interface LatestByCompanyParams {
  /** Restrict to annual (10-K) or quarterly (10-Q) filings. Omit for whichever is most recent. */
  period?: "annual" | "quarterly";
}

export interface StatementHistoryParams {
  /**
   * annual = fiscal years; quarterly = single quarters; ytd = year-to-date spans from
   * quarterly filings (the only complete series for cash flow, which 10-Qs report year to date).
   */
  period?: "annual" | "quarterly" | "ytd";
  /** Number of most recent periods to return (1-40). */
  limit?: number;
}

export interface SharesOutstandingParams {
  ticker?: string;
  /** Takes precedence over ticker. */
  cik?: string;
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
  /** Fiscal year as YYYY. Omit for the latest period matching `qtrs`. */
  period?: string;
  /** Reporting span: 1-3 for quarterly (Q1-Q3), 4 for fiscal year. */
  qtrs?: number;
  accessionNumber?: string;
  limit?: number;
}

export interface SegmentCompareParams {
  metric?: string;
  axis?: string;
  segmentType?: string;
  /** Comma-separated fiscal years as YYYY. */
  periods?: ListParam;
  /** Reporting span: 1-3 for quarterly (Q1-Q3), 4 for fiscal year. */
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

  /**
   * The company's most recent 10-K or 10-Q with its standardized income statement, balance
   * sheet and cash flow statement in one response. `issuer` is a ticker or a CIK. A statement
   * is null when it could not be standardized for that filing.
   */
  latest(issuer: string, params: LatestByCompanyParams = {}): Promise<CompanyLatestFinancialsResponse> {
    return this.client.get(`/v1/financials/${encodePath(issuer)}/latest`, {
      period: params.period,
    });
  }

  /** Annual and quarterly filings of a company, newest first. `issuer` is a ticker or a CIK. */
  filings(issuer: string, params: CompanyFilingsParams = {}): Promise<CompanyFinancialFilingsResponse> {
    return this.client.get(`/v1/financials/${encodePath(issuer)}/filings`, {
      limit: params.limit,
      page: params.page,
    });
  }

  /** A statement as filed, from the company's most recent filing that contains it. */
  companyStatement(
    issuer: string,
    statement: StatementKind,
    params: LatestByCompanyParams = {},
  ): Promise<CompanyFinancialStatement> {
    return this.client.get(`/v1/financials/${encodePath(issuer)}/statements/${encodePath(statement)}`, {
      period: params.period,
    });
  }

  /**
   * Standardized statement history for a company: the most recent periods, newest first, one
   * entry per period end. Restated periods come from the latest filing that reports them.
   */
  statementHistory(
    issuer: string,
    statement: StandardizedStatementKind,
    params: StatementHistoryParams = {},
  ): Promise<CompanyStandardizedStatementsResponse> {
    return this.client.get(
      `/v1/financials/${encodePath(issuer)}/statements/${encodePath(statement)}/standardized`,
      {
        period: params.period,
        limit: params.limit,
      },
    );
  }

  sharesOutstanding(params: SharesOutstandingParams): Promise<SharesOutstandingResponse> {
    return this.client.get("/v1/financials/shares-outstanding", {
      ticker: params.ticker,
      cik: params.cik,
    });
  }

  incomeStatement(accessionNumber?: string, params: StatementLookupParams = {}): Promise<CompanyFinancialStatement> {
    return this.statementFor("income-statement", accessionNumber, params);
  }

  balanceSheet(accessionNumber?: string, params: StatementLookupParams = {}): Promise<CompanyFinancialStatement> {
    return this.statementFor("balance-sheet", accessionNumber, params);
  }

  cashFlow(accessionNumber?: string, params: StatementLookupParams = {}): Promise<CompanyFinancialStatement> {
    return this.statementFor("cash-flow", accessionNumber, params);
  }

  stockholdersEquity(
    accessionNumber?: string,
    params: StatementLookupParams = {},
  ): Promise<CompanyFinancialStatement> {
    return this.statementFor("stockholders-equity", accessionNumber, params);
  }

  comprehensiveIncome(
    accessionNumber?: string,
    params: StatementLookupParams = {},
  ): Promise<CompanyFinancialStatement> {
    return this.statementFor("comprehensive-income", accessionNumber, params);
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

  /**
   * With an accession number: that filing's statement. With only a ticker or CIK: the API
   * picks the company's latest filing that has the statement (one request). A `form` other
   * than 10-K / 10-Q still goes through the filing search, which can match any form.
   */
  private async statementFor(
    kind: StatementKind,
    accessionNumber: string | undefined,
    params: StatementLookupParams,
  ): Promise<CompanyFinancialStatement> {
    const issuer = params.cik ?? params.ticker;
    const period = periodForForm(params.form);
    if (!accessionNumber && issuer && period !== null) {
      return this.companyStatement(issuer, kind, period ? { period } : {});
    }
    const accession = await this.requireAccession(accessionNumber, params);
    return this.statement(accession, kind);
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

/** undefined = no form filter; "annual"/"quarterly" = 10-K/10-Q; null = some other form. */
function periodForForm(form: string | undefined): "annual" | "quarterly" | undefined | null {
  if (!form) {
    return undefined;
  }
  const upper = form.trim().toUpperCase();
  if (upper === "10-K") {
    return "annual";
  }
  if (upper === "10-Q") {
    return "quarterly";
  }
  return null;
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
