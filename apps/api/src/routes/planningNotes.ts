import { Router } from "express";
import { planningNoteController } from "../controllers/planningNoteController";

const router = Router();

router.get("/", planningNoteController.findByQuarter);
router.get("/:id", planningNoteController.findById);
router.post("/", planningNoteController.create);
router.patch("/:id", planningNoteController.update);
router.delete("/:id", planningNoteController.delete);
router.post("/reorder", planningNoteController.reorder);

export default router;
