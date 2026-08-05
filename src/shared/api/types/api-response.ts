export interface ApiResponseMeta {
  requestId: string;
  timestamp?: string;
  path?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ApiSuccessResponse<TData> {
  success: true;
  data: TData;
  meta: ApiResponseMeta;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
  meta: ApiResponseMeta;
}
