import { create } from "zustand";
import { api } from "@/lib/api";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@proj-mgmt/shared";

interface ProjectWithCount extends Project {
  _count: { tasks: number };
}

interface ProjectState {
  projects: ProjectWithCount[];
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  addProject: (data: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectInput) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await api.projects.list();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addProject: async (data) => {
    const project = await api.projects.create(data);
    set((state) => ({
      projects: [...state.projects, { ...project, _count: { tasks: 0 } }],
    }));
    return project;
  },

  updateProject: async (id, data) => {
    const previousProjects = get().projects;
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    }));

    try {
      await api.projects.update(id, data);
    } catch (error) {
      set({ projects: previousProjects, error: (error as Error).message });
      throw error;
    }
  },

  deleteProject: async (id) => {
    const previousProjects = get().projects;
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    }));

    try {
      await api.projects.delete(id);
    } catch (error) {
      set({ projects: previousProjects, error: (error as Error).message });
      throw error;
    }
  },
}));
