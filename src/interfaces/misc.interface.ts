export interface ReqQueryOptions {
  page?: number;
  limit?: number;
  offset?: number;
  search?: string | undefined | null;
}

export interface PaginatedResponse<T> {
  result: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  previousPage: number | null;
  nextPage: number | null;
}
