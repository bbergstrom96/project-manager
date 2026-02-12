import { z } from "zod";

export const createAreaSchema = z.object({
  name: z.string().min(1, "Area name is required").max(100),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const updateAreaSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().max(10).nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderAreasSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

export const updateAreaGoalSchema = z.object({
  content: z.string().max(5000),
});

export type CreateAreaSchema = z.infer<typeof createAreaSchema>;
export type UpdateAreaSchema = z.infer<typeof updateAreaSchema>;
export type ReorderAreasSchema = z.infer<typeof reorderAreasSchema>;
export type UpdateAreaGoalSchema = z.infer<typeof updateAreaGoalSchema>;
