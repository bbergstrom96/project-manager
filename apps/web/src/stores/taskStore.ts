import { create } from "zustand";
import { api } from "@/lib/api";
import type { TaskWithLabels, CreateTaskInput, UpdateTaskInput, TaskFilters } from "@proj-mgmt/shared";

interface TaskState {
  tasks: TaskWithLabels[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  filters: TaskFilters;
  lastFetchedFiltersKey: string;

  setFilters: (filters: TaskFilters) => void;
  setTasks: (tasks: TaskWithLabels[]) => void;
  setTask: (task: TaskWithLabels) => void;
  invalidate: () => void;
  fetchTasks: (force?: boolean) => Promise<void>;
  addTask: (data: CreateTaskInput) => Promise<TaskWithLabels>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  reopenTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (orderedIds: string[]) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  isInitialized: false,
  error: null,
  filters: {},
  lastFetchedFiltersKey: "",

  setFilters: (filters) => {
    const newKey = JSON.stringify(filters);
    const currentKey = get().lastFetchedFiltersKey;

    // Skip if already fetched with same filters
    if (newKey === currentKey && get().isInitialized) {
      return;
    }

    set({ filters });
    get().fetchTasks();
  },

  setTasks: (tasks) => {
    set({ tasks });
  },

  setTask: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    }));
  },

  invalidate: () => {
    set({ lastFetchedFiltersKey: "", isInitialized: false });
  },

  fetchTasks: async (force = false) => {
    const currentFilters = get().filters;
    const filtersKey = JSON.stringify(currentFilters);

    // Skip if already fetched with same filters (unless forced)
    if (!force && filtersKey === get().lastFetchedFiltersKey && get().isInitialized) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const tasks = await api.tasks.list(currentFilters);
      set({ tasks, isLoading: false, isInitialized: true, lastFetchedFiltersKey: filtersKey });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false, isInitialized: true });
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
    } catch (error: any) {
      // If task is already gone, that's fine
      if (error?.code === "NOT_FOUND") {
        return;
      }
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
    } catch (error: any) {
      // If task is already gone (NOT_FOUND), that's fine - mission accomplished
      if (error?.code === "NOT_FOUND") {
        return;
      }
      set({ tasks: previousTasks, error: (error as Error).message });
      throw error;
    }
  },

  reorderTasks: async (orderedIds) => {
    // Optimistic update - reorder tasks in state
    const previousTasks = get().tasks;
    const taskMap = new Map(previousTasks.map((t) => [t.id, t]));
    const reorderedTasks = orderedIds
      .map((id) => taskMap.get(id))
      .filter((t): t is TaskWithLabels => t !== undefined);

    // Keep any tasks not in orderedIds at the end
    const otherTasks = previousTasks.filter((t) => !orderedIds.includes(t.id));

    set({ tasks: [...reorderedTasks, ...otherTasks] });

    try {
      await api.tasks.reorder(orderedIds);
    } catch (error) {
      set({ tasks: previousTasks, error: (error as Error).message });
      throw error;
    }
  },
}));
