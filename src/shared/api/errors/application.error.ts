export interface ApplicationErrorOptions {
  code: string;
  message: string;
  details?: unknown;
}

export class ApplicationError extends Error {
  readonly code: string;
  readonly details?: unknown;

  constructor(options: ApplicationErrorOptions) {
    super(options.message);
    this.name = new.target.name;
    this.code = options.code;
    this.details = options.details;
  }
}
