import { create } from "zustand";
import { api } from "@/lib/api";
import type { TaskWithLabels, CreateTaskInput, UpdateTaskInput, TaskFilters } from "@proj-mgmt/shared";

interface TaskState {
  tasks: TaskWithLabels[];
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;

  setFilters: (filters: TaskFilters) => void;
  fetchTasks: () => Promise<void>;
  addTask: (data: CreateTaskInput) => Promise<TaskWithLabels>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  reopenTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  filters: {},

  setFilters: (filters) => {
    set({ filters });
    get().fetchTasks();
  },

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await api.tasks.list(get().filters);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addTask: async (data) => {
    const task = await api.tasks.create(data);
    set((state) => ({ tasks: [...state.tasks, task] }));
    return task;
  },

  updateTask: async (id, data) => {
    // Optimistic update
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    }));

    try {
      const updated = await api.tasks.update(id, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
      }));
    } catch (error) {
      // Rollback
      set({ tasks: previousTasks, error: (error as Error).message });
      throw error;
    }
  },

  completeTask: async (id) => {
    // Optimistic: remove from list
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));

    try {
      await api.tasks.complete(id);
    } catch (error) {
      set({ tasks: previousTasks, error: (error as Error).message });
      throw error;
    }
  },

  reopenTask: async (id) => {
    try {
      const task = await api.tasks.reopen(id);
      set((state) => ({ tasks: [...state.tasks, task] }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteTask: async (id) => {
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));

    try {
      await api.tasks.delete(id);
    } catch (error) {
      set({ tasks: previousTasks, error: (error as Error).message });
      throw error;
    }
  },
}));
