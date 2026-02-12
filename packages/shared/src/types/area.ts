export interface Area {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AreaGoal {
  id: string;
  areaId: string;
  period: string; // "2026-3" for month, "2026-3.2" for week
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AreaWithGoals extends Area {
  goals: AreaGoal[];
}

export interface AreaWithProjects extends Area {
  projects: import("./project").Project[];
}

export interface AreaWithTasks extends Area {
  tasks: import("./task").Task[];
}

export interface AreaWithProjectsAndTasks extends Area {
  projects: import("./project").Project[];
  tasks: import("./task").Task[];
}

export interface CreateAreaInput {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateAreaInput {
  name?: string;
  icon?: string | null;
  color?: string;
  order?: number;
}

export interface CreateAreaGoalInput {
  areaId: string;
  period: string;
  content: string;
}

export interface UpdateAreaGoalInput {
  content: string;
}
