import { create } from "zustand";
import { api } from "@/lib/api";
import type { PlanningNote, CreatePlanningNoteInput, UpdatePlanningNoteInput } from "@proj-mgmt/shared";

interface PlanningNoteState {
  notes: PlanningNote[];
  currentQuarter: string;
  activeNoteId: string | null;
  isLoading: boolean;
  error: string | null;

  setCurrentQuarter: (quarter: string) => void;
  setActiveNoteId: (id: string | null) => void;
  fetchNotes: (quarter?: string) => Promise<void>;
  addNote: (data?: Partial<CreatePlanningNoteInput>) => Promise<PlanningNote>;
  updateNote: (id: string, data: UpdatePlanningNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

function getCurrentQuarter(): string {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${quarter}`;
}

export const usePlanningNoteStore = create<PlanningNoteState>((set, get) => ({
  notes: [],
  currentQuarter: getCurrentQuarter(),
  activeNoteId: null,
  isLoading: false,
  error: null,

  setCurrentQuarter: (quarter) => {
    set({ currentQuarter: quarter });
    get().fetchNotes(quarter);
  },

  setActiveNoteId: (id) => {
    set({ activeNoteId: id });
  },

  fetchNotes: async (quarter?: string) => {
    const targetQuarter = quarter || get().currentQuarter;
    set({ isLoading: true, error: null });
    try {
      const notes = await api.planningNotes.list(targetQuarter);
      const currentActiveId = get().activeNoteId;
      // If no active note or active note not in new list, select first one
      const activeNoteId = notes.find(n => n.id === currentActiveId)
        ? currentActiveId
        : notes[0]?.id || null;
      set({ notes, isLoading: false, activeNoteId });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addNote: async (data) => {
    const quarter = get().currentQuarter;
    const note = await api.planningNotes.create({
      quarter,
      title: data?.title,
      content: data?.content,
    });
    set((state) => ({
      notes: [...state.notes, note],
      activeNoteId: note.id,
    }));
    return note;
  },

  updateNote: async (id, data) => {
    // Optimistic update
    const previousNotes = get().notes;
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...data } : n
      ),
    }));

    try {
      const updated = await api.planningNotes.update(id, data);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updated : n)),
      }));
    } catch (error) {
      // Rollback
      set({ notes: previousNotes, error: (error as Error).message });
      throw error;
    }
  },

  deleteNote: async (id) => {
    const previousNotes = get().notes;
    const deletedIndex = previousNotes.findIndex((n) => n.id === id);

    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    }));

    try {
      await api.planningNotes.delete(id);
      // If we deleted the active note, select another
      if (get().activeNoteId === id) {
        const remaining = get().notes;
        const newActiveIndex = Math.min(deletedIndex, remaining.length - 1);
        set({ activeNoteId: remaining[newActiveIndex]?.id || null });
      }
    } catch (error) {
      set({ notes: previousNotes, error: (error as Error).message });
      throw error;
    }
  },
}));
