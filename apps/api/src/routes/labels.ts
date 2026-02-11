import { Router } from "express";
import { labelController } from "../controllers/labelController";
import { validate } from "../middleware/validateRequest";
import {
  createLabelSchema,
  updateLabelSchema,
  reorderLabelsSchema,
} from "@proj-mgmt/shared";

const router = Router();

router.get("/", labelController.findAll);
router.get("/:id", labelController.findById);
router.post("/", validate(createLabelSchema), labelController.create);
router.patch("/:id", validate(updateLabelSchema), labelController.update);
router.delete("/:id", labelController.delete);
router.post("/reorder", validate(reorderLabelsSchema), labelController.reorder);

export default router;
