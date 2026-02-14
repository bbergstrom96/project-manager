import { create } from "zustand";
import { api } from "@/lib/api";
import type {
  RoutineWithSections,
  Routine,
  RoutineSection,
  RoutineItem,
  CreateRoutineInput,
  UpdateRoutineInput,
  CreateRoutineSectionInput,
  UpdateRoutineSectionInput,
  CreateRoutineItemInput,
  UpdateRoutineItemInput,
} from "@proj-mgmt/shared";

interface RoutineState {
  routines: RoutineWithSections[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  fetchRoutines: () => Promise<void>;
  addRoutine: (data: CreateRoutineInput) => Promise<Routine>;
  updateRoutine: (id: string, data: UpdateRoutineInput) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  reorderRoutines: (orderedIds: string[]) => Promise<void>;

  // Sections
  addSection: (routineId: string, data: CreateRoutineSectionInput) => Promise<RoutineSection>;
  updateSection: (id: string, data: UpdateRoutineSectionInput) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  reorderSections: (orderedIds: string[]) => Promise<void>;

  // Items
  addItem: (sectionId: string, data: CreateRoutineItemInput) => Promise<RoutineItem>;
  updateItem: (id: string, data: UpdateRoutineItemInput) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  reorderItems: (orderedIds: string[]) => Promise<void>;

  // Completions
  completeItem: (itemId: string) => Promise<void>;
  uncompleteItem: (itemId: string) => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routines: [],
  isLoading: false,
  isInitialized: false,
  error: null,

  fetchRoutines: async () => {
    set({ isLoading: true, error: null });
    try {
      const routines = await api.routines.list();
      set({ routines, isLoading: false, isInitialized: true });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false, isInitialized: true });
    }
  },

  addRoutine: async (data) => {
    const routine = await api.routines.create(data);
    // Refetch to get the full structure
    await get().fetchRoutines();
    return routine;
  },

  updateRoutine: async (id, data) => {
    // Optimistic update
    const previousRoutines = get().routines;
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === id ? { ...r, ...data } : r
      ),
    }));

    try {
      await api.routines.update(id, data);
    } catch (error) {
      set({ routines: previousRoutines, error: (error as Error).message });
      throw error;
    }
  },

  deleteRoutine: async (id) => {
    const previousRoutines = get().routines;
    set((state) => ({
      routines: state.routines.filter((r) => r.id !== id),
    }));

    try {
      await api.routines.delete(id);
    } catch (error) {
      set({ routines: previousRoutines, error: (error as Error).message });
      throw error;
    }
  },

  reorderRoutines: async (orderedIds) => {
    const previousRoutines = get().routines;
    // Optimistic reorder
    const reordered = orderedIds
      .map((id) => previousRoutines.find((r) => r.id === id))
      .filter(Boolean) as RoutineWithSections[];
    set({ routines: reordered });

    try {
      await api.routines.reorder(orderedIds);
    } catch (error) {
      set({ routines: previousRoutines, error: (error as Error).message });
      throw error;
    }
  },

  // Sections
  addSection: async (routineId, data) => {
    const section = await api.routineSections.create(routineId, data);
    // Add section to the routine
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === routineId
          ? { ...r, sections: [...r.sections, { ...section, items: [] }] }
          : r
      ),
    }));
    return section;
  },

  updateSection: async (id, data) => {
    const previousRoutines = get().routines;
    set((state) => ({
      routines: state.routines.map((r) => ({
        ...r,
        sections: r.sections.map((s) =>
          s.id === id ? { ...s, ...data } : s
        ),
      })),
    }));

    try {
      await api.routineSections.update(id, data);
    } catch (error) {
      set({ routines: previousRoutines, error: (error as Error).message });
      throw error;
    }
  },

  deleteSection: async (id) => {
    const previousRoutines = get().routines;
    set((state) => ({
      routines: state.routines.map((r) => ({
        ...r,
        sections: r.sections.filter((s) => s.id !== id),
      })),
    }));

    try {
      await api.routineSections.delete(id);
    } catch (error) {
      set({ routines: previousRoutines, error: (error as Error).message });
      throw error;
    }
  },

  reorderSections: async (orderedIds) => {
    const previousRoutines = get().routines;
    // Find which routine these sections belong to
    set((state) => ({
      routines: state.routines.map((r) => {
        const routineSectionIds = r.sections.map((s) => s.id);
        const isThisRoutine = orderedIds.some((id) => routineSectionIds.includes(id));
        if (!isThisRoutine) return r;

        const reordered = orderedIds
          .map((id) => r.sections.find((s) => s.id === id))
          .filter(Boolean) as typeof r.sections;
        return { ...r, sections: reordered };
      }),
    }));

    try {
      await api.routineSections.reorder(orderedIds);
    } catch (error) {
      set({ routines: previousRoutines, error: (error as Error).message });
      throw error;
    }
  },

  // Items
  addItem: async (sectionId, data) => {
    const item = await api.routineItems.create(sectionId, data);
    // Add item to the section
    set((state) => ({
      routines: state.routines.map((r) => ({
        ...r,
        sections: r.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                items: data.parentId
                  ? s.items.map((i) =>
                      i.id === data.parentId
                        ? { ...i, subItems: [...(i.subItems || []), { ...item, isCompleted: false }] }
                        : i
                    )
                  : [...s.items, { ...item, isCompleted: false }],
              }
            : s
        ),
      })),
    }));
    return item;
  },

  updateItem: async (id, data) => {
    const previousRoutines = get().routines;

    // Handle parentId changes (moving items to become sub-items or vice versa)
    if ('parentId' in data) {
      set((state) => ({
        routines: state.routines.map((r) => ({
          ...r,
          sections: r.sections.map((s) => {
            // Find the item being moved
            let itemToMove: typeof s.items[0] | undefined;

            // Check if it's a top-level item
            const topLevelItem = s.items.find((i) => i.id === id);
            if (topLevelItem) {
              itemToMove = { ...topLevelItem, ...data, subItems: topLevelItem.subItems };
            }

            // Check if it's a sub-item
            if (!itemToMove) {
              for (const item of s.items) {
                const subItem = item.subItems?.find((sub) => sub.id === id);
                if (subItem) {
                  itemToMove = { ...subItem, ...data };
                  break;
                }
              }
            }

            if (!itemToMove) return s;

            // Remove item from its current position
            let newItems = s.items
              .filter((i) => i.id !== id)
              .map((i) => ({
                ...i,
                subItems: i.subItems?.filter((sub) => sub.id !== id),
              }));

            // Add to new position
            if (data.parentId) {
              // Make it a sub-item of the target
              newItems = newItems.map((i) =>
                i.id === data.parentId
                  ? { ...i, subItems: [...(i.subItems || []), { ...itemToMove!, isCompleted: itemToMove!.isCompleted ?? false }] }
                  : i
              );
            } else if (data.parentId === null) {
              // Make it a top-level item
              newItems = [...newItems, { ...itemToMove!, isCompleted: itemToMove!.isCompleted ?? false }];
            }

            return { ...s, items: newItems };
          }),
        })),
      }));
    } else {
      // Simple update without moving
      set((state) => ({
        routines: state.routines.map((r) => ({
          ...r,
          sections: r.sections.map((s) => ({
            ...s,
            items: s.items.map((i) =>
              i.id === id
                ? { ...i, ...data }
                : {
                    ...i,
                    subItems: i.subItems?.map((sub) =>
                      sub.id === id ? { ...sub, ...data } : sub
                    ),
                  }
            ),
          })),
        })),
      }));
    }

    try {
      await api.routineItems.update(id, data);
      // Refetch to get correct order after parent change
      if ('parentId' in data) {
        await get().fetchRoutines();
      }
    } catch (error) {
      set({ routines: previousRoutines, error: (error as Error).message });
      throw error;
    }
  },

  deleteItem: async (id) => {
    const previousRoutines = get().routines;
    set((state) => ({
      routines: state.routines.map((r) => ({
        ...r,
        sections: r.sections.map((s) => ({
          ...s,
          items: s.items
            .filter((i) => i.id !== id)
            .map((i) => ({
              ...i,
              subItems: i.subItems?.filter((sub) => sub.id !== id),
            })),
        })),
      })),
    }));

    try {
      await api.routineItems.delete(id);
    } catch (error) {
      set({ routines: previousRoutines, error: (error as Error).message });
      throw error;
    }
  },

  reorderItems: async (orderedIds) => {
    const previousRoutines = get().routines;
    set((state) => ({
      routines: state.routines.map((r) => ({
        ...r,
        sections: r.sections.map((s) => {
          const sectionItemIds = s.items.map((i) => i.id);
          const isThisSection = orderedIds.some((id) => sectionItemIds.includes(id));
          if (!isThisSection) return s;

          const reordered = orderedIds
            .map((id) => s.items.find((i) => i.id === id))
            .filter(Boolean) as typeof s.items;
          return { ...s, items: reordered };
        }),
      })),
    }));

    try {
      await api.routineItems.reorder(orderedIds);
    } catch (error) {
      set({ routines: previousRoutines, error: (error as Error).message });
      throw error;
    }
  },

  // Completions
  completeItem: async (itemId) => {
    const previousRoutines = get().routines;
    // Optimistic update
    set((state) => ({
      routines: state.routines.map((r) => ({
        ...r,
        sections: r.sections.map((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === itemId
              ? { ...i, isCompleted: true }
              : {
                  ...i,
                  subItems: i.subItems?.map((sub) =>
                    sub.id === itemId ? { ...sub, isCompleted: true } : sub
                  ),
                }
          ),
        })),
      })),
    }));

    try {
      await api.routineItems.complete(itemId);
    } catch (error) {
      set({ routines: previousRoutines, error: (error as Error).message });
      throw error;
    }
  },

  uncompleteItem: async (itemId) => {
    const previousRoutines = get().routines;
    // Optimistic update
    set((state) => ({
      routines: state.routines.map((r) => ({
        ...r,
        sections: r.sections.map((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === itemId
              ? { ...i, isCompleted: false }
              : {
                  ...i,
                  subItems: i.subItems?.map((sub) =>
                    sub.id === itemId ? { ...sub, isCompleted: false } : sub
                  ),
                }
          ),
        })),
      })),
    }));

    try {
      await api.routineItems.uncomplete(itemId);
    } catch (error) {
      set({ routines: previousRoutines, error: (error as Error).message });
      throw error;
    }
  },
}));
