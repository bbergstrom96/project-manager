import { Router } from "express";
import { areaController } from "../controllers/areaController";

const router = Router();

router.get("/", areaController.findAll);
router.get("/goals", areaController.getGoalsForPeriods);
router.get("/:id", areaController.findById);
router.post("/", areaController.create);
router.patch("/:id", areaController.update);
router.delete("/:id", areaController.delete);
router.post("/reorder", areaController.reorder);
router.put("/:id/goals/:period", areaController.upsertGoal);

export default router;
