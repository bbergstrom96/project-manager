import { z } from "zod";

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(50000).optional(),
  color: z.string().regex(hexColorRegex, "Invalid color format").optional(),
  isFavorite: z.boolean().optional().default(false),
  areaId: z.string().cuid().optional(),
  startWeek: z.string().optional(),
  endWeek: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(50000).nullable().optional(),
  color: z.string().regex(hexColorRegex).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  areaId: z.string().cuid().nullable().optional(),
  startWeek: z.string().nullable().optional(),
  endWeek: z.string().nullable().optional(),
});

export const createSectionSchema = z.object({
  name: z.string().min(1, "Section name is required").max(100),
});

export const updateSectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderProjectsSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>;
export type CreateSectionSchema = z.infer<typeof createSectionSchema>;
export type UpdateSectionSchema = z.infer<typeof updateSectionSchema>;
export type ReorderProjectsSchema = z.infer<typeof reorderProjectsSchema>;
