import { Router } from "express";
import { taskController } from "../controllers/taskController";
import { validate } from "../middleware/validateRequest";
import {
  createTaskSchema,
  updateTaskSchema,
  reorderTasksSchema,
} from "@proj-mgmt/shared";

const router = Router();

router.get("/", taskController.findAll);
router.get("/:id", taskController.findById);
router.post("/", validate(createTaskSchema), taskController.create);
router.patch("/:id", validate(updateTaskSchema), taskController.update);
router.post("/:id/complete", taskController.complete);
router.post("/:id/reopen", taskController.reopen);
router.delete("/:id", taskController.delete);
router.post("/reorder", validate(reorderTasksSchema), taskController.reorder);

export default router;
