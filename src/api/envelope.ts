// The backend wraps almost every response in modules/core/response.py's
// success_response/error_response shape. The one exception is the paginated
// invoices list, which returns DRF's native PageNumberPagination shape
// instead (see invoicing/views/invoice.py InvoiceViewSet.list — it calls
// get_paginated_response() directly rather than wrapping with success_response).
// Validation errors raised via serializer.is_valid(raise_exception=True) are
// reshaped by modules/core/exceptions.py custom_exception_handler into the
// ApiErrorEnvelope shape below, which differs slightly from error_response's
// own shape (`error.details` vs `errors`) — readErrorMessage() normalizes both.

export interface ApiMeta {
  request_id: string;
  timestamp: string;
}

export interface ApiSuccessEnvelope<T> {
  status: "success";
  message: string;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorEnvelope {
  status: "error";
  message: string;
  errors?: Record<string, string[] | string> | null;
  error?: { code: string; details: unknown };
  meta: ApiMeta;
}

export interface PaginatedEnvelope<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function isPaginated<T>(payload: unknown): payload is PaginatedEnvelope<T> {
  return (
    !!payload &&
    typeof payload === "object" &&
    "results" in payload &&
    "count" in payload
  );
}

/** Best-effort, human-readable message out of either error envelope shape. */
export function readErrorMessage(payload: unknown, fallback = "Something went wrong."): string {
  if (!payload || typeof payload !== "object") return fallback;
  const body = payload as Partial<ApiErrorEnvelope>;
  if (body.message) return body.message;
  if (body.errors) {
    const first = Object.values(body.errors)[0];
    if (Array.isArray(first)) return first[0] ?? fallback;
    if (typeof first === "string") return first;
  }
  return fallback;
}
