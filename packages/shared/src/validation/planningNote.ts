import { z } from "zod";

export const createPlanningNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).default("New Note"),
  content: z.string().max(100000).optional().default(""),
  quarter: z.string().regex(/^\d{4}-Q[1-4]$/, "Quarter must be in format YYYY-Q1/Q2/Q3/Q4"),
});

export const updatePlanningNoteSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.string().max(100000).optional(),
  order: z.number().int().min(0).optional(),
});

export type CreatePlanningNoteSchema = z.infer<typeof createPlanningNoteSchema>;
export type UpdatePlanningNoteSchema = z.infer<typeof updatePlanningNoteSchema>;
