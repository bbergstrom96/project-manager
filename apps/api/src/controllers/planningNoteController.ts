import { Request, Response, NextFunction } from "express";
import { planningNoteService } from "../services/planningNoteService";

export const planningNoteController = {
  async findByQuarter(req: Request, res: Response, next: NextFunction) {
    try {
      const quarter = req.query.quarter as string;
      if (!quarter) {
        return res.status(400).json({ success: false, error: "Quarter is required" });
      }
      const notes = await planningNoteService.findByQuarter(quarter);
      res.json({ success: true, data: notes });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await planningNoteService.findById(req.params.id);
      res.json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await planningNoteService.create(req.body);
      res.status(201).json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await planningNoteService.update(req.params.id, req.body);
      res.json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await planningNoteService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { quarter, orderedIds } = req.body;
      await planningNoteService.reorder(quarter, orderedIds);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  },
};
