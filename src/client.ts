import { BaseSECClient, type SECClientOptions } from "./http.js";
import { Entities } from "./resources/entities.js";
import { Filings } from "./resources/filings.js";
import { Financials } from "./resources/financials.js";
import { Insiders } from "./resources/insiders.js";
import { Institutions } from "./resources/institutions.js";

export class SECClient extends BaseSECClient {
  readonly entities: Entities;
  readonly filings: Filings;
  readonly financials: Financials;
  readonly insiders: Insiders;
  readonly institutions: Institutions;

  constructor(options: SECClientOptions = {}) {
    super(options);
    this.entities = new Entities(this);
    this.filings = new Filings(this);
    this.financials = new Financials(this);
    this.insiders = new Insiders(this);
    this.institutions = new Institutions(this);
  }
}

export type { SECClientOptions };
