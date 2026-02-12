import { create } from "zustand";
import { api } from "@/lib/api";
import type { Area, Project, CreateAreaInput, UpdateAreaInput } from "@proj-mgmt/shared";

interface AreaWithProjects extends Area {
  projects: Project[];
}

interface AreaState {
  areas: AreaWithProjects[];
  goals: Record<string, Record<string, string>>; // areaId -> period -> content
  isLoading: boolean;
  error: string | null;

  fetchAreas: () => Promise<void>;
  addArea: (data: CreateAreaInput) => Promise<Area>;
  updateArea: (id: string, data: UpdateAreaInput) => Promise<void>;
  deleteArea: (id: string) => Promise<void>;
  reorderProjectsInArea: (areaId: string, reorderedProjects: Project[]) => void;
  fetchGoals: (periods: string[]) => Promise<void>;
  updateGoal: (areaId: string, period: string, content: string) => Promise<void>;
}

export const useAreaStore = create<AreaState>((set, get) => ({
  areas: [],
  goals: {},
  isLoading: false,
  error: null,

  fetchAreas: async () => {
    set({ isLoading: true, error: null });
    try {
      const areas = await api.areas.list() as AreaWithProjects[];
      set({ areas, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addArea: async (data) => {
    const area = await api.areas.create(data);
    set((state) => ({
      areas: [...state.areas, { ...area, projects: [] }],
    }));
    return area;
  },

  updateArea: async (id, data) => {
    const previousAreas = get().areas;
    set((state) => ({
      areas: state.areas.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    }));

    try {
      await api.areas.update(id, data);
    } catch (error) {
      set({ areas: previousAreas, error: (error as Error).message });
      throw error;
    }
  },

  deleteArea: async (id) => {
    const previousAreas = get().areas;
    set((state) => ({
      areas: state.areas.filter((a) => a.id !== id),
    }));

    try {
      await api.areas.delete(id);
    } catch (error) {
      set({ areas: previousAreas, error: (error as Error).message });
      throw error;
    }
  },

  reorderProjectsInArea: (areaId, reorderedProjects) => {
    set((state) => ({
      areas: state.areas.map((a) =>
        a.id === areaId ? { ...a, projects: reorderedProjects } : a
      ),
    }));
  },

  fetchGoals: async (periods) => {
    try {
      const goals = await api.areas.getGoalsForPeriods(periods);
      set({ goals });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateGoal: async (areaId, period, content) => {
    // Optimistic update
    set((state) => ({
      goals: {
        ...state.goals,
        [areaId]: {
          ...state.goals[areaId],
          [period]: content,
        },
      },
    }));

    try {
      await api.areas.upsertGoal(areaId, period, { content });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
}));
