import { create } from "zustand";
import { api } from "@/lib/api";
import type { Section, UpdateSectionInput } from "@proj-mgmt/shared";

interface SectionState {
  sections: Section[];
  isLoading: boolean;
  error: string | null;

  fetchSections: (projectId: string) => Promise<void>;
  addSection: (projectId: string, name: string) => Promise<Section>;
  updateSection: (id: string, data: UpdateSectionInput) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  reorderSections: (orderedIds: string[]) => Promise<void>;
  clearSections: () => void;
}

export const useSectionStore = create<SectionState>((set, get) => ({
  sections: [],
  isLoading: false,
  error: null,

  fetchSections: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const sections = await api.sections.list(projectId);
      set({ sections, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addSection: async (projectId, name) => {
    const section = await api.sections.create(projectId, { name });
    set((state) => ({
      sections: [...state.sections, section],
    }));
    return section;
  },

  updateSection: async (id, data) => {
    const previousSections = get().sections;
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    }));

    try {
      await api.sections.update(id, data);
    } catch (error) {
      set({ sections: previousSections, error: (error as Error).message });
      throw error;
    }
  },

  deleteSection: async (id) => {
    const previousSections = get().sections;
    set((state) => ({
      sections: state.sections.filter((s) => s.id !== id),
    }));

    try {
      await api.sections.delete(id);
    } catch (error) {
      set({ sections: previousSections, error: (error as Error).message });
      throw error;
    }
  },

  reorderSections: async (orderedIds) => {
    const previousSections = get().sections;
    // Optimistically reorder
    const reordered = orderedIds
      .map((id) => previousSections.find((s) => s.id === id))
      .filter(Boolean) as Section[];
    set({ sections: reordered });

    try {
      await api.sections.reorder(orderedIds);
    } catch (error) {
      set({ sections: previousSections, error: (error as Error).message });
      throw error;
    }
  },

  clearSections: () => {
    set({ sections: [], isLoading: false, error: null });
  },
}));
