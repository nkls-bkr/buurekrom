export class ApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(`API ${status}: ${body || "(empty body)"}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
