import { Router } from "express";
import { routineController } from "../controllers/routineController";
import { validate } from "../middleware/validateRequest";
import {
  updateRoutineSectionSchema,
  reorderRoutineSectionsSchema,
  createRoutineItemSchema,
} from "@proj-mgmt/shared";

const router = Router();

// Sections
router.patch("/:id", validate(updateRoutineSectionSchema), routineController.updateSection);
router.delete("/:id", routineController.deleteSection);
router.post("/reorder", validate(reorderRoutineSectionsSchema), routineController.reorderSections);

// Items (nested under sections)
router.post(
  "/:id/items",
  validate(createRoutineItemSchema),
  routineController.createItem
);

export default router;
