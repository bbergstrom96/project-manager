import { z } from "zod";

export const prioritySchema = z.enum(["P1", "P2", "P3", "P4"]);

export const createTaskSchema = z.object({
  content: z.string().min(1, "Task content is required").max(500),
  description: z.string().max(2000).optional(),
  priority: prioritySchema.optional().default("P4"),
  dueDate: z.string().datetime().optional(),
  dueDateTime: z.string().datetime().optional(),
  scheduledWeek: z.string().regex(/^\d{4}-W\d{2}$/, "Must be ISO week format (e.g., 2026-W08)").optional(),
  projectId: z.string().cuid().optional(),
  sectionId: z.string().cuid().optional(),
  areaId: z.string().cuid().optional(),
  parentId: z.string().cuid().optional(),
  labelIds: z.array(z.string().cuid()).optional(),
});

export const updateTaskSchema = z.object({
  content: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).nullable().optional(),
  priority: prioritySchema.optional(),
  dueDate: z.string().datetime().nullable().optional(),
  dueDateTime: z.string().datetime().nullable().optional(),
  scheduledWeek: z.string().regex(/^\d{4}-W\d{2}$/, "Must be ISO week format (e.g., 2026-W08)").nullable().optional(),
  projectId: z.string().cuid().nullable().optional(),
  sectionId: z.string().cuid().nullable().optional(),
  areaId: z.string().cuid().nullable().optional(),
  parentId: z.string().cuid().nullable().optional(),
  labelIds: z.array(z.string().cuid()).optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderTasksSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;
export type ReorderTasksSchema = z.infer<typeof reorderTasksSchema>;
