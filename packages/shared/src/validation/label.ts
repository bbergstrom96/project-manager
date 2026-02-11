import { z } from "zod";

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const createLabelSchema = z.object({
  name: z.string().min(1, "Label name is required").max(50),
  color: z.string().regex(hexColorRegex, "Invalid color format").optional(),
  isFavorite: z.boolean().optional().default(false),
});

export const updateLabelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(hexColorRegex).optional(),
  isFavorite: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderLabelsSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

export type CreateLabelSchema = z.infer<typeof createLabelSchema>;
export type UpdateLabelSchema = z.infer<typeof updateLabelSchema>;
export type ReorderLabelsSchema = z.infer<typeof reorderLabelsSchema>;
