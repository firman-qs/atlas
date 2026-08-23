export interface FieldError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: FieldError[];
}

export interface PaginatedView<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}
