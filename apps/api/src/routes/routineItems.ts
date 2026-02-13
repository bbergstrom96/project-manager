import { Router } from "express";
import { routineController } from "../controllers/routineController";
import { validate } from "../middleware/validateRequest";
import {
  updateRoutineItemSchema,
  reorderRoutineItemsSchema,
} from "@proj-mgmt/shared";

const router = Router();

// Items
router.patch("/:id", validate(updateRoutineItemSchema), routineController.updateItem);
router.delete("/:id", routineController.deleteItem);
router.post("/reorder", validate(reorderRoutineItemsSchema), routineController.reorderItems);

// Completions
router.post("/:id/complete", routineController.completeItem);
router.post("/:id/uncomplete", routineController.uncompleteItem);

export default router;
