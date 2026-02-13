import { Router } from "express";
import tasksRouter from "./tasks";
import projectsRouter from "./projects";
import sectionsRouter from "./sections";
import labelsRouter from "./labels";
import areasRouter from "./areas";
import planningNotesRouter from "./planningNotes";
import routinesRouter from "./routines";
import routineSectionsRouter from "./routineSections";
import routineItemsRouter from "./routineItems";
import healthRouter from "./health";

const router = Router();

router.use("/health", healthRouter);
router.use("/tasks", tasksRouter);
router.use("/projects", projectsRouter);
router.use("/sections", sectionsRouter);
router.use("/labels", labelsRouter);
router.use("/areas", areasRouter);
router.use("/planning-notes", planningNotesRouter);
router.use("/routines", routinesRouter);
router.use("/routine-sections", routineSectionsRouter);
router.use("/routine-items", routineItemsRouter);

export default router;
