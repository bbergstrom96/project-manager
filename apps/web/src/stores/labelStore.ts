import { create } from "zustand";
import { api } from "@/lib/api";
import type { Label, CreateLabelInput, UpdateLabelInput } from "@proj-mgmt/shared";

interface LabelWithCount extends Label {
  _count: { tasks: number };
}

interface LabelState {
  labels: LabelWithCount[];
  isLoading: boolean;
  error: string | null;

  fetchLabels: () => Promise<void>;
  addLabel: (data: CreateLabelInput) => Promise<Label>;
  updateLabel: (id: string, data: UpdateLabelInput) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
}

export const useLabelStore = create<LabelState>((set, get) => ({
  labels: [],
  isLoading: false,
  error: null,

  fetchLabels: async () => {
    set({ isLoading: true, error: null });
    try {
      const labels = await api.labels.list();
      set({ labels, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addLabel: async (data) => {
    const label = await api.labels.create(data);
    set((state) => ({
      labels: [...state.labels, { ...label, _count: { tasks: 0 } }],
    }));
    return label;
  },

  updateLabel: async (id, data) => {
    const previousLabels = get().labels;
    set((state) => ({
      labels: state.labels.map((l) =>
        l.id === id ? { ...l, ...data } : l
      ),
    }));

    try {
      await api.labels.update(id, data);
    } catch (error) {
      set({ labels: previousLabels, error: (error as Error).message });
      throw error;
    }
  },

  deleteLabel: async (id) => {
    const previousLabels = get().labels;
    set((state) => ({
      labels: state.labels.filter((l) => l.id !== id),
    }));

    try {
      await api.labels.delete(id);
    } catch (error) {
      set({ labels: previousLabels, error: (error as Error).message });
      throw error;
    }
  },
}));
