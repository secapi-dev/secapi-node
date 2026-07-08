export type SecApiPrimitive = string | number | boolean | null;
export type SecApiJson = SecApiPrimitive | SecApiJson[] | { [key: string]: SecApiJson };
export type SecApiObject = Record<string, unknown>;

export interface Pagination extends SecApiObject {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasMoreData?: boolean;
}

export interface ListResponse<T extends SecApiObject = SecApiObject> extends SecApiObject {
  data?: T[];
  pagination?: Pagination;
}

export type Entity = SecApiObject;
export type Filing = SecApiObject;
export type FilingDocument = SecApiObject;
export type FilingFormType = SecApiObject;
export type EntitySic = SecApiObject;
export type FinancialStatement = SecApiObject;
export type FinancialXbrl = SecApiObject;
export type FinancialMetricSeries = SecApiObject;
export type FinancialMetricRanking = SecApiObject;
export type FinancialRatioSeries = SecApiObject;
export type FinancialRatioRanking = SecApiObject;
export type FinancialSegment = SecApiObject;
export type InsiderTransaction = SecApiObject;
export type InsiderPerson = SecApiObject;
export type Institution = SecApiObject;
export type InstitutionFiling = SecApiObject;

export type EntitiesListResponse = ListResponse<Entity>;
export type EntitySicListResponse = ListResponse<EntitySic>;
export type FilingsListResponse = ListResponse<Filing>;
export type FilingFormTypesListResponse = ListResponse<FilingFormType>;
export type CompaniesSearchResponse = SecApiObject;
export type ConceptsListResponse = ListResponse<SecApiObject>;
export type CompanyFinancialStatement = FinancialStatement;
export type CanonicalIncomeStatement = SecApiObject;
export type CanonicalBalanceSheet = SecApiObject;
export type CanonicalCashFlow = SecApiObject;
export type FinancialMetricSeriesResponse = FinancialMetricSeries;
export type FinancialMetricRankingResponse = FinancialMetricRanking;
export type FinancialRatioSeriesResponse = FinancialRatioSeries;
export type FinancialRatioRankingResponse = FinancialRatioRanking;
export type FinancialSegmentResponse = FinancialSegment;
export type InsiderTransactionsResponse = SecApiObject;
export type InsiderDailyActivityResponse = SecApiObject;
export type InsiderStatisticsResponse = SecApiObject;
export type InsiderCompaniesResponse = ListResponse<SecApiObject>;
export type InsiderPersonsResponse = ListResponse<InsiderPerson>;
export type InsiderOwnersResponse = SecApiObject;
export type InsiderBuySellRatioResponse = SecApiObject;
export type InsiderNetSharesResponse = SecApiObject;
export type InsiderNetValueResponse = SecApiObject;
export type InsiderHoldingsResponse = SecApiObject;
export type InsiderHoldingsSummaryResponse = SecApiObject;
export type InstitutionsListResponse = ListResponse<Institution>;
export type InstitutionProfileResponse = SecApiObject;
export type InstitutionsActivityResponse = SecApiObject;
export type InstitutionFilingsResponse = ListResponse<InstitutionFiling>;
export type InstitutionFilingPeriodsResponse = SecApiObject;
export type InstitutionsHoldingsResponse = SecApiObject;
export type InstitutionsHoldingsHistoryResponse = SecApiObject;
export type InstitutionChangesResponse = SecApiObject;
export type InstitutionTradingActivityResponse = SecApiObject;
export type InstitutionPortfolioCompositionResponse = SecApiObject;
