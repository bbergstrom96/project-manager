import { Router } from "express";
import tasksRouter from "./tasks";
import projectsRouter from "./projects";
import sectionsRouter from "./sections";
import labelsRouter from "./labels";
import healthRouter from "./health";

const router = Router();

router.use("/health", healthRouter);
router.use("/tasks", tasksRouter);
router.use("/projects", projectsRouter);
router.use("/sections", sectionsRouter);
router.use("/labels", labelsRouter);

export default router;
