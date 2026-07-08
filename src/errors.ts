export class SecApiError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SecApiError";
  }
}

export class APIConnectionError extends SecApiError {
  constructor(message = "Could not connect to the SEC API.", options?: ErrorOptions) {
    super(message, options);
    this.name = "APIConnectionError";
  }
}

export class APITimeoutError extends APIConnectionError {
  constructor(message = "Request to the SEC API timed out.", options?: ErrorOptions) {
    super(message, options);
    this.name = "APITimeoutError";
  }
}

export interface APIStatusErrorOptions {
  statusCode: number;
  code?: string | undefined;
  details?: unknown;
  requestId?: string | undefined;
  body?: unknown;
}

export class APIStatusError extends SecApiError {
  readonly statusCode: number;
  readonly code?: string | undefined;
  readonly details?: unknown;
  readonly requestId?: string | undefined;
  readonly body?: unknown;
  readonly apiMessage: string;

  protected static defaultMessage = "The SEC API returned an error.";

  constructor(message: string | undefined, options: APIStatusErrorOptions) {
    const apiMessage = message ?? new.target.defaultMessage;
    const suffix = options.requestId
      ? ` (status=${options.statusCode}, request_id=${options.requestId})`
      : ` (status=${options.statusCode})`;
    super(`${apiMessage}${suffix}`);
    this.name = new.target.name;
    this.apiMessage = apiMessage;
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
    this.body = options.body;
  }
}

export class BadRequestError extends APIStatusError {
  protected static override defaultMessage = "The request was invalid. Check your parameters and try again.";
}

export const ValidationError = BadRequestError;

export class AuthenticationError extends APIStatusError {
  protected static override defaultMessage = "Invalid or missing API key.";
}

export class PermissionDeniedError extends APIStatusError {
  protected static override defaultMessage = "Your API key does not have access to this resource.";
}

export class NotFoundError extends APIStatusError {
  protected static override defaultMessage = "The requested resource was not found.";
}

export class RateLimitError extends APIStatusError {
  protected static override defaultMessage = "API rate limit exceeded for your plan.";
}

export class ServerError extends APIStatusError {
  protected static override defaultMessage = "The SEC API had an internal error. Please retry shortly.";
}

type ErrorInfo = {
  code?: string | undefined;
  message?: string | undefined;
  details?: unknown;
  requestId?: string | undefined;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function parseErrorBody(body: unknown): ErrorInfo {
  if (!isRecord(body)) {
    return {};
  }

  const nested = body.error;
  const error = isRecord(nested) ? nested : body;
  return {
    code: asString(error.code),
    message: asString(error.message),
    details: error.details,
    requestId: asString(error.request_id) ?? asString(error.requestId),
  };
}

export function makeStatusError(statusCode: number, body?: unknown, requestId?: string | null): APIStatusError {
  const info = parseErrorBody(body);
  const options: APIStatusErrorOptions = {
    statusCode,
    code: info.code,
    details: info.details,
    requestId: info.requestId ?? requestId ?? undefined,
    body,
  };

  if (statusCode >= 500) {
    return new ServerError(info.message, options);
  }

  switch (statusCode) {
    case 400:
      return new BadRequestError(info.message, options);
    case 401:
      return new AuthenticationError(info.message, options);
    case 403:
      return new PermissionDeniedError(info.message, options);
    case 404:
      return new NotFoundError(info.message, options);
    case 429:
      return new RateLimitError(info.message, options);
    default:
      return new APIStatusError(info.message, options);
  }
}
