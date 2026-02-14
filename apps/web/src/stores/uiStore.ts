import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  hasMounted: boolean;
  addTaskOpen: boolean;
  selectedTaskId: string | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setHasMounted: () => void;
  setAddTaskOpen: (open: boolean) => void;
  setSelectedTaskId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Start with sidebar open (consistent for SSR), adjust after mount on mobile
  sidebarOpen: true,
  hasMounted: false,
  addTaskOpen: false,
  selectedTaskId: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setHasMounted: () => set((state) => {
    // On first mount, close sidebar on mobile
    if (!state.hasMounted && typeof window !== "undefined" && window.innerWidth < 768) {
      return { hasMounted: true, sidebarOpen: false };
    }
    return { hasMounted: true };
  }),
  setAddTaskOpen: (open) => set({ addTaskOpen: open }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
}));
