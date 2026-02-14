import { z } from "zod";

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

// Routine schemas
export const createRoutineSchema = z.object({
  name: z.string().min(1, "Routine name is required").max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().regex(hexColorRegex, "Invalid color format").optional(),
});

export const updateRoutineSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(10).nullable().optional(),
  color: z.string().regex(hexColorRegex).optional(),
  isArchived: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderRoutinesSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

// Routine Section schemas
export const createRoutineSectionSchema = z.object({
  name: z.string().max(100), // Empty string allowed for default/unsectioned items
});

export const updateRoutineSectionSchema = z.object({
  name: z.string().max(100).optional(), // Empty string allowed for default/unsectioned items
  order: z.number().int().min(0).optional(),
});

export const reorderRoutineSectionsSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

// Routine Item schemas
export const createRoutineItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(200),
  description: z.string().max(500).optional(),
  isTrackable: z.boolean().optional().default(false),
  parentId: z.string().cuid().optional(),
});

export const updateRoutineItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).nullable().optional(),
  isTrackable: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  sectionId: z.string().cuid().optional(),
  parentId: z.string().cuid().nullable().optional(),
});

export const reorderRoutineItemsSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

// Export inferred types
export type CreateRoutineSchema = z.infer<typeof createRoutineSchema>;
export type UpdateRoutineSchema = z.infer<typeof updateRoutineSchema>;
export type ReorderRoutinesSchema = z.infer<typeof reorderRoutinesSchema>;
export type CreateRoutineSectionSchema = z.infer<typeof createRoutineSectionSchema>;
export type UpdateRoutineSectionSchema = z.infer<typeof updateRoutineSectionSchema>;
export type ReorderRoutineSectionsSchema = z.infer<typeof reorderRoutineSectionsSchema>;
export type CreateRoutineItemSchema = z.infer<typeof createRoutineItemSchema>;
export type UpdateRoutineItemSchema = z.infer<typeof updateRoutineItemSchema>;
export type ReorderRoutineItemsSchema = z.infer<typeof reorderRoutineItemsSchema>;
