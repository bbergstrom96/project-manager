export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface TaskFilters {
  projectId?: string;
  sectionId?: string;
  labelId?: string;
  priority?: string;
  dueDate?: "today" | "upcoming" | "overdue";
  completed?: boolean;
}
