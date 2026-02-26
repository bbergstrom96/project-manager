export type Priority = "P1" | "P2" | "P3" | "P4";

export interface Task {
  id: string;
  content: string;
  description: string | null;
  priority: Priority;
  isCompleted: boolean;
  completedAt: Date | null;
  dueDate: Date | null;
  dueDateTime: Date | null;
  scheduledWeek: string | null;
  order: number;
  projectId: string | null;
  sectionId: string | null;
  areaId: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubtaskWithLabels extends Task {
  labels: { label: Label }[];
}

export interface TaskWithLabels extends Task {
  labels: { label: Label }[];
  project?: Project | null;
  section?: Section | null;
  area?: Area | null;
  subtasks?: SubtaskWithLabels[];
}

export interface CreateTaskInput {
  content: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  dueDateTime?: string;
  scheduledWeek?: string;
  projectId?: string;
  sectionId?: string;
  areaId?: string;
  parentId?: string;
  labelIds?: string[];
}

export interface UpdateTaskInput {
  content?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
  dueDateTime?: string | null;
  scheduledWeek?: string | null;
  projectId?: string | null;
  sectionId?: string | null;
  areaId?: string | null;
  parentId?: string | null;
  labelIds?: string[];
  order?: number;
}

// Forward declarations for related types
import type { Label } from "./label";
import type { Project } from "./project";
import type { Section } from "./project";
import type { Area } from "./area";
