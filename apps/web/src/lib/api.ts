import type {
  ApiResponse,
  TaskWithLabels,
  CreateTaskInput,
  UpdateTaskInput,
  Project,
  ProjectWithTasks,
  CreateProjectInput,
  UpdateProjectInput,
  Section,
  CreateSectionInput,
  UpdateSectionInput,
  Label,
  CreateLabelInput,
  UpdateLabelInput,
  TaskFilters,
  Area,
  AreaGoal,
  CreateAreaInput,
  UpdateAreaInput,
  UpdateAreaGoalInput,
  PlanningNote,
  CreatePlanningNoteInput,
  UpdatePlanningNoteInput,
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

  // Handle empty responses (e.g., 204 No Content or empty body)
  const text = await response.text();
  if (!text) {
    if (response.ok) {
      return undefined as T;
    }
    throw new ApiError("UNKNOWN_ERROR", "Empty response from server");
  }

  const data = JSON.parse(text) as ApiResponse<T>;

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
          area_id: filters?.areaId,
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
    reorder: (orderedIds: string[]) =>
      request<void>("/projects/reorder", {
        method: "POST",
        body: JSON.stringify({ orderedIds }),
      }),
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

  sections: {
    list: (projectId: string) =>
      request<Section[]>(`/projects/${projectId}/sections`),
    create: (projectId: string, data: Omit<CreateSectionInput, "projectId">) =>
      request<Section>(`/projects/${projectId}/sections`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateSectionInput) =>
      request<Section>(`/sections/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/sections/${id}`, { method: "DELETE" }),
    reorder: (orderedIds: string[]) =>
      request<void>("/sections/reorder", {
        method: "POST",
        body: JSON.stringify({ orderedIds }),
      }),
  },

  areas: {
    list: () => request<Area[]>("/areas"),
    get: (id: string) => request<Area & { goals: AreaGoal[] }>(`/areas/${id}`),
    create: (data: CreateAreaInput) =>
      request<Area>("/areas", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateAreaInput) =>
      request<Area>(`/areas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/areas/${id}`, { method: "DELETE" }),
    upsertGoal: (areaId: string, period: string, data: UpdateAreaGoalInput) =>
      request<AreaGoal>(`/areas/${areaId}/goals/${period}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    getGoalsForPeriods: (periods: string[]) =>
      request<Record<string, Record<string, string>>>(
        `/areas/goals?periods=${periods.join(",")}`
      ),
  },

  planningNotes: {
    list: (quarter: string) =>
      request<PlanningNote[]>(`/planning-notes?quarter=${quarter}`),
    get: (id: string) => request<PlanningNote>(`/planning-notes/${id}`),
    create: (data: CreatePlanningNoteInput) =>
      request<PlanningNote>("/planning-notes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdatePlanningNoteInput) =>
      request<PlanningNote>(`/planning-notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/planning-notes/${id}`, { method: "DELETE" }),
    reorder: (quarter: string, orderedIds: string[]) =>
      request<void>("/planning-notes/reorder", {
        method: "POST",
        body: JSON.stringify({ quarter, orderedIds }),
      }),
  },
};
