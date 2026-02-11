export interface Project {
  id: string;
  name: string;
  color: string;
  isFavorite: boolean;
  isArchived: boolean;
  order: number;
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
  color?: string;
  isFavorite?: boolean;
}

export interface UpdateProjectInput {
  name?: string;
  color?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  order?: number;
}

export interface CreateSectionInput {
  name: string;
  projectId: string;
}

export interface UpdateSectionInput {
  name?: string;
  order?: number;
}
