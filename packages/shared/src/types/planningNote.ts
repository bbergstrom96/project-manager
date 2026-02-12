export interface PlanningNote {
  id: string;
  title: string;
  content: string;
  quarter: string; // Format: "2026-Q1", "2026-Q2", etc.
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlanningNoteInput {
  title?: string;
  content?: string;
  quarter: string;
}

export interface UpdatePlanningNoteInput {
  title?: string;
  content?: string;
  order?: number;
}
