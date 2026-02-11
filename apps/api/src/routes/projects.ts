import { Router } from "express";
import { projectController } from "../controllers/projectController";
import { validate } from "../middleware/validateRequest";
import {
  createProjectSchema,
  updateProjectSchema,
  createSectionSchema,
  updateSectionSchema,
  reorderProjectsSchema,
} from "@proj-mgmt/shared";

const router = Router();

// Projects
router.get("/", projectController.findAll);
router.get("/:id", projectController.findById);
router.post("/", validate(createProjectSchema), projectController.create);
router.patch("/:id", validate(updateProjectSchema), projectController.update);
router.post("/:id/archive", projectController.archive);
router.post("/:id/unarchive", projectController.unarchive);
router.delete("/:id", projectController.delete);
router.post(
  "/reorder",
  validate(reorderProjectsSchema),
  projectController.reorder
);

// Sections (nested under projects)
router.get("/:projectId/sections", projectController.getSections);
router.post(
  "/:projectId/sections",
  validate(createSectionSchema),
  projectController.createSection
);

export default router;
