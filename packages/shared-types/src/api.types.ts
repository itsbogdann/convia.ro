/**
 * Common API response shapes used by both the dashboard and the widget.
 * The NestJS TransformInterceptor wraps every successful response in
 * { success: true, data: T }.
 */

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  statusCode: number;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/** Pagination wrapper for list endpoints */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Standard pagination query params */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
