export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isFavorite: boolean;
  isArchived: boolean;
  order: number;
  startWeek: string | null;  // Format: "M.W" e.g., "3.1" = March week 1
  endWeek: string | null;    // Format: "M.W" e.g., "12.3" = December week 3
  areaId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectWithSections extends Project {
  sections: Section[];
}

export interface ProjectWithTasks extends Project {
  sections: Section[];
  tasks: import("./task").Task[];
}

export interface Section {
  id: string;
  name: string;
  order: number;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  isFavorite?: boolean;
  areaId?: string;
  startWeek?: string;
  endWeek?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  color?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  order?: number;
  startWeek?: string | null;
  endWeek?: string | null;
  areaId?: string | null;
}

export interface CreateSectionInput {
  name: string;
  projectId: string;
}

export interface UpdateSectionInput {
  name?: string;
  order?: number;
}
