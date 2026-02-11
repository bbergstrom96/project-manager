import type {
  ApiResponse,
  TaskWithLabels,
  CreateTaskInput,
  UpdateTaskInput,
  Project,
  ProjectWithTasks,
  CreateProjectInput,
  UpdateProjectInput,
  Label,
  CreateLabelInput,
  UpdateLabelInput,
  TaskFilters,
} from "@proj-mgmt/shared";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = (await response.json()) as ApiResponse<T>;

  if (!data.success) {
    throw new ApiError(
      data.error.code,
      data.error.message,
      data.error.details
    );
  }

  return data.data;
}

function buildQueryString(params: Record<string, string | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const api = {
  tasks: {
    list: (filters?: TaskFilters) =>
      request<TaskWithLabels[]>(
        `/tasks${buildQueryString({
          project_id: filters?.projectId,
          section_id: filters?.sectionId,
          label_id: filters?.labelId,
          priority: filters?.priority,
          due_date: filters?.dueDate,
          completed: filters?.completed,
        })}`
      ),
    get: (id: string) => request<TaskWithLabels>(`/tasks/${id}`),
    create: (data: CreateTaskInput) =>
      request<TaskWithLabels>("/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateTaskInput) =>
      request<TaskWithLabels>(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    complete: (id: string) =>
      request<TaskWithLabels>(`/tasks/${id}/complete`, { method: "POST" }),
    reopen: (id: string) =>
      request<TaskWithLabels>(`/tasks/${id}/reopen`, { method: "POST" }),
    delete: (id: string) =>
      request<void>(`/tasks/${id}`, { method: "DELETE" }),
    reorder: (orderedIds: string[]) =>
      request<void>("/tasks/reorder", {
        method: "POST",
        body: JSON.stringify({ orderedIds }),
      }),
  },

  projects: {
    list: (includeArchived = false) =>
      request<(Project & { _count: { tasks: number } })[]>(
        `/projects${buildQueryString({ include_archived: includeArchived })}`
      ),
    get: (id: string) => request<ProjectWithTasks>(`/projects/${id}`),
    create: (data: CreateProjectInput) =>
      request<Project>("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateProjectInput) =>
      request<Project>(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    archive: (id: string) =>
      request<Project>(`/projects/${id}/archive`, { method: "POST" }),
    unarchive: (id: string) =>
      request<Project>(`/projects/${id}/unarchive`, { method: "POST" }),
    delete: (id: string) =>
      request<void>(`/projects/${id}`, { method: "DELETE" }),
  },

  labels: {
    list: () => request<(Label & { _count: { tasks: number } })[]>("/labels"),
    get: (id: string) => request<Label>(`/labels/${id}`),
    create: (data: CreateLabelInput) =>
      request<Label>("/labels", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateLabelInput) =>
      request<Label>(`/labels/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/labels/${id}`, { method: "DELETE" }),
  },
};
