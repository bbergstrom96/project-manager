import { Router } from "express";
import { routineController } from "../controllers/routineController";
import { validate } from "../middleware/validateRequest";
import {
  createRoutineSchema,
  updateRoutineSchema,
  reorderRoutinesSchema,
  createRoutineSectionSchema,
} from "@proj-mgmt/shared";

const router = Router();

// Routines
router.get("/", routineController.findAll);
router.get("/:id", routineController.findById);
router.post("/", validate(createRoutineSchema), routineController.create);
router.patch("/:id", validate(updateRoutineSchema), routineController.update);
router.delete("/:id", routineController.delete);
router.post("/reorder", validate(reorderRoutinesSchema), routineController.reorder);

// Sections (nested under routines)
router.post(
  "/:id/sections",
  validate(createRoutineSectionSchema),
  routineController.createSection
);

export default router;
