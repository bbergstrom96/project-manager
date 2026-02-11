import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  addTaskOpen: boolean;
  selectedTaskId: string | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setAddTaskOpen: (open: boolean) => void;
  setSelectedTaskId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  addTaskOpen: false,
  selectedTaskId: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setAddTaskOpen: (open) => set({ addTaskOpen: open }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
}));
