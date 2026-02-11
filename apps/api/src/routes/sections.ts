import { Router } from "express";
import { projectController } from "../controllers/projectController";
import { validate } from "../middleware/validateRequest";
import { updateSectionSchema, reorderProjectsSchema } from "@proj-mgmt/shared";

const router = Router();

router.patch("/:id", validate(updateSectionSchema), projectController.updateSection);
router.delete("/:id", projectController.deleteSection);
router.post("/reorder", validate(reorderProjectsSchema), projectController.reorderSections);

export default router;
