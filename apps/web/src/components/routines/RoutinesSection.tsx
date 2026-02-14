"use client";

import { useEffect, useState } from "react";
import { Plus, ChevronDown, ChevronRight, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRoutineStore } from "@/stores/routineStore";
import { SortableRoutineItem, RoutineItemOverlay } from "@/components/routines/SortableRoutineItem";
import type { RoutineWithSections, RoutineItemWithCompletion, RoutineSectionWithItems } from "@proj-mgmt/shared";

export function RoutinesSection() {
  const {
    routines,
    isLoading,
    isInitialized,
    fetchRoutines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    addSection,
    updateSection,
    deleteSection,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    completeItem,
    uncompleteItem,
  } = useRoutineStore();

  const [expandedRoutines, setExpandedRoutines] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("expandedRoutines");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("expandedSections");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [addRoutineOpen, setAddRoutineOpen] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [editingRoutine, setEditingRoutine] = useState<RoutineWithSections | null>(null);
  const [editRoutineName, setEditRoutineName] = useState("");
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);
  const [addingSectionTo, setAddingSectionTo] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [addingItemToRoutine, setAddingItemToRoutine] = useState<string | null>(null);
  const [newRoutineItemName, setNewRoutineItemName] = useState("");
  const [editingSection, setEditingSection] = useState<{ id: string; name: string } | null>(null);
  const [editSectionName, setEditSectionName] = useState("");
  const [addingSubItemTo, setAddingSubItemTo] = useState<{ parentId: string; sectionId: string } | null>(null);
  const [newSubItemName, setNewSubItemName] = useState("");
  const [hasInitializedExpansion, setHasInitializedExpansion] = useState(false);

  // Drag state
  const [activeItem, setActiveItem] = useState<RoutineItemWithCompletion | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!isInitialized) {
      fetchRoutines();
    }
  }, [fetchRoutines, isInitialized]);

  // Expand all routines by default on first load (only if no saved state)
  useEffect(() => {
    if (routines.length > 0 && !hasInitializedExpansion) {
      const hasSavedRoutineState = localStorage.getItem("expandedRoutines") !== null;
      const hasSavedSectionState = localStorage.getItem("expandedSections") !== null;

      if (!hasSavedRoutineState) {
        const allRoutineIds = new Set(routines.map((r) => r.id));
        setExpandedRoutines(allRoutineIds);
        localStorage.setItem("expandedRoutines", JSON.stringify([...allRoutineIds]));
      }

      if (!hasSavedSectionState) {
        const allSectionIds = new Set(routines.flatMap((r) => r.sections.map((s) => s.id)));
        setExpandedSections(allSectionIds);
        localStorage.setItem("expandedSections", JSON.stringify([...allSectionIds]));
      }

      setHasInitializedExpansion(true);
    }
  }, [routines, hasInitializedExpansion]);

  const toggleRoutine = (id: string) => {
    setExpandedRoutines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem("expandedRoutines", JSON.stringify([...next]));
      return next;
    });
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem("expandedSections", JSON.stringify([...next]));
      return next;
    });
  };

  const handleAddRoutine = async () => {
    if (!newRoutineName.trim()) return;
    await addRoutine({ name: newRoutineName.trim() });
    setNewRoutineName("");
    setAddRoutineOpen(false);
  };

  const handleEditRoutine = async () => {
    if (!editingRoutine || !editRoutineName.trim()) return;
    await updateRoutine(editingRoutine.id, { name: editRoutineName.trim() });
    setEditingRoutine(null);
    setEditRoutineName("");
  };

  const handleDeleteRoutine = async () => {
    if (!deleteRoutineId) return;
    await deleteRoutine(deleteRoutineId);
    setDeleteRoutineId(null);
  };

  const handleAddSection = async (routineId: string) => {
    if (!newSectionName.trim()) return;
    await addSection(routineId, { name: newSectionName.trim() });
    setNewSectionName("");
    setAddingSectionTo(null);
  };

  const handleEditSection = async () => {
    if (!editingSection || !editSectionName.trim()) return;
    await updateSection(editingSection.id, { name: editSectionName.trim() });
    setEditingSection(null);
    setEditSectionName("");
  };

  const handleAddItem = async (sectionId: string) => {
    if (!newItemName.trim()) return;
    await addItem(sectionId, { name: newItemName.trim() });
    setNewItemName("");
    setAddingItemTo(null);
  };

  const handleUpdateItem = async (id: string, name: string) => {
    await updateItem(id, { name });
  };

  const handleAddItemToRoutine = async (routineId: string) => {
    if (!newRoutineItemName.trim()) return;
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    let defaultSection = routine.sections.find((s) => s.name === "");
    let sectionId: string;

    if (!defaultSection) {
      const section = await addSection(routineId, { name: "" });
      sectionId = section.id;
      setExpandedSections((prev) => new Set([...prev, sectionId]));
    } else {
      sectionId = defaultSection.id;
    }

    await addItem(sectionId, { name: newRoutineItemName.trim() });
    setNewRoutineItemName("");
    setAddingItemToRoutine(null);
  };

  const handleToggleItem = async (item: RoutineItemWithCompletion, parentItem?: RoutineItemWithCompletion) => {
    if (item.isCompleted) {
      await uncompleteItem(item.id);

      // If this is a subtask and we just uncompleted it, uncomplete the parent too
      if (parentItem && parentItem.isCompleted) {
        await uncompleteItem(parentItem.id);
      }
    } else {
      await completeItem(item.id);

      // If this is a subtask and we just completed it, check if all siblings are done
      if (parentItem && parentItem.subItems) {
        const allSubItemsComplete = parentItem.subItems.every(
          (sub) => sub.id === item.id ? true : sub.isCompleted
        );
        if (allSubItemsComplete && !parentItem.isCompleted) {
          await completeItem(parentItem.id);
        }
      }
    }
  };

  const handleAddSubItem = (parentId: string, sectionId: string) => {
    setAddingSubItemTo({ parentId, sectionId });
    setNewSubItemName("");
  };

  const handleCreateSubItem = async () => {
    if (!addingSubItemTo || !newSubItemName.trim()) return;
    await addItem(addingSubItemTo.sectionId, {
      name: newSubItemName.trim(),
      parentId: addingSubItemTo.parentId
    });
    setNewSubItemName("");
    setAddingSubItemTo(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;
    if (data?.item) {
      setActiveItem(data.item);
    }
  };

  const handleDragEnd = async (event: DragEndEvent, section: RoutineSectionWithItems) => {
    const { active, over } = event;

    setActiveItem(null);

    if (!over || active.id === over.id) return;

    // Simple reorder within top-level items
    const oldIndex = section.items.findIndex((i) => i.id === active.id);
    const newIndex = section.items.findIndex((i) => i.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(section.items, oldIndex, newIndex);
      await reorderItems(newOrder.map((i) => i.id));
    }
  };

  const handleDragCancel = () => {
    setActiveItem(null);
  };

  const getCompletionStats = (routine: RoutineWithSections) => {
    let total = 0;
    let completed = 0;
    routine.sections.forEach((section) => {
      section.items.forEach((item) => {
        total++;
        if (item.isCompleted) completed++;
        item.subItems?.forEach((sub) => {
          total++;
          if (sub.isCompleted) completed++;
        });
      });
    });
    return { total, completed };
  };

  const renderItems = (section: RoutineSectionWithItems) => {
    const itemIds = section.items.map((i) => i.id);

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={(event) => handleDragEnd(event, section)}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {section.items.map((item) => (
            <div key={item.id}>
              <SortableRoutineItem
                item={item}
                sectionId={section.id}
                onToggle={(i) => handleToggleItem(i)}
                onUpdate={handleUpdateItem}
                onDelete={deleteItem}
                onAddSubItem={(parentId) => handleAddSubItem(parentId, section.id)}
              />
              {/* Sub Items */}
              {(item.subItems && item.subItems.length > 0) || addingSubItemTo?.parentId === item.id ? (
                <div className="ml-8 space-y-1 border-l-2 border-muted pl-2">
                  {item.subItems?.map((subItem) => (
                    <SortableRoutineItem
                      key={subItem.id}
                      item={subItem}
                      sectionId={section.id}
                      onToggle={(i) => handleToggleItem(i, item)}
                      onUpdate={handleUpdateItem}
                      onDelete={deleteItem}
                      isSubItem
                    />
                  ))}
                  {/* Inline add subtask */}
                  {addingSubItemTo?.parentId === item.id && (
                    <div className="flex items-center gap-2 py-1 pl-6">
                      <Input
                        value={newSubItemName}
                        onChange={(e) => setNewSubItemName(e.target.value)}
                        placeholder="New subtask..."
                        className="h-7 text-sm flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateSubItem();
                          if (e.key === "Escape") {
                            setAddingSubItemTo(null);
                            setNewSubItemName("");
                          }
                        }}
                      />
                      <Button size="sm" className="h-7" onClick={handleCreateSubItem}>
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7"
                        onClick={() => {
                          setAddingSubItemTo(null);
                          setNewSubItemName("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </SortableContext>
        <DragOverlay>
          {activeItem ? <RoutineItemOverlay item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    );
  };

  if (isLoading && routines.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Routines</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Routines</h2>
        <Button variant="ghost" size="sm" onClick={() => setAddRoutineOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-3">No routines yet</p>
          <Button size="sm" onClick={() => setAddRoutineOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create routine
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => {
            const isExpanded = expandedRoutines.has(routine.id);
            const stats = getCompletionStats(routine);

            return (
              <div
                key={routine.id}
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: routine.color }}
              >
                {/* Routine Header */}
                <div
                  className="flex items-center gap-2 px-3 md:px-4 py-3 md:py-3 bg-muted/30 cursor-pointer"
                  onClick={() => toggleRoutine(routine.id)}
                >
                  <button className="text-muted-foreground p-1">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 md:h-4 md:w-4" />
                    ) : (
                      <ChevronRight className="h-5 w-5 md:h-4 md:w-4" />
                    )}
                  </button>
                  {routine.icon && <span>{routine.icon}</span>}
                  <span className="font-semibold flex-1" style={{ color: routine.color }}>
                    {routine.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stats.completed}/{stats.total}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRoutine(routine);
                          setEditRoutineName(routine.name);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddingSectionTo(routine.id);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddingItemToRoutine(routine.id);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteRoutineId(routine.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Sections */}
                {isExpanded && (
                  <div className="p-3 space-y-3">
                    {/* Default section items (no card wrapper) */}
                    {routine.sections
                      .filter((s) => s.name === "")
                      .map((section) => (
                        <div key={section.id} className="space-y-1">
                          {renderItems(section)}
                        </div>
                      ))}

                    {/* Named sections (with card wrapper) */}
                    {routine.sections
                      .filter((s) => s.name !== "")
                      .map((section) => {
                        const isSectionExpanded = expandedSections.has(section.id);

                        return (
                          <div
                            key={section.id}
                            className="bg-[#252830] border border-[#353a45] rounded-lg overflow-hidden"
                          >
                            {/* Section Header */}
                            <div
                              className="flex items-center gap-2 px-3 py-2 cursor-pointer group"
                              onClick={() => toggleSection(section.id)}
                            >
                              <button className="text-muted-foreground">
                                {isSectionExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </button>
                              <span
                                className="text-sm font-medium uppercase tracking-wide flex-1"
                                style={{ color: routine.color }}
                              >
                                {section.name}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSection({ id: section.id, name: section.name });
                                      setEditSectionName(section.name);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAddingItemTo(section.id);
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteSection(section.id);
                                    }}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Section
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Items */}
                            {isSectionExpanded && (
                              <div className="px-3 pb-3 space-y-1">
                                {renderItems(section)}

                                {/* Add Item Inline */}
                                {addingItemTo === section.id && (
                                  <div className="flex items-center gap-2 py-1">
                                    <Input
                                      value={newItemName}
                                      onChange={(e) => setNewItemName(e.target.value)}
                                      placeholder="New item..."
                                      className="h-8 text-sm"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAddItem(section.id);
                                        if (e.key === "Escape") {
                                          setAddingItemTo(null);
                                          setNewItemName("");
                                        }
                                      }}
                                    />
                                    <Button size="sm" onClick={() => handleAddItem(section.id)}>
                                      Add
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setAddingItemTo(null);
                                        setNewItemName("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                )}

                                {/* Add Item Button */}
                                {addingItemTo !== section.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-muted-foreground"
                                    onClick={() => setAddingItemTo(section.id)}
                                  >
                                    <Plus className="h-3 w-3 mr-2" />
                                    Add item
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                    {/* Add Section Inline */}
                    {addingSectionTo === routine.id && (
                      <div className="flex items-center gap-2">
                        <Input
                          value={newSectionName}
                          onChange={(e) => setNewSectionName(e.target.value)}
                          placeholder="Section name..."
                          className="h-8 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddSection(routine.id);
                            if (e.key === "Escape") {
                              setAddingSectionTo(null);
                              setNewSectionName("");
                            }
                          }}
                        />
                        <Button size="sm" onClick={() => handleAddSection(routine.id)}>
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setAddingSectionTo(null);
                            setNewSectionName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {/* Add Item to Routine Inline */}
                    {addingItemToRoutine === routine.id && (
                      <div className="flex items-center gap-2">
                        <Input
                          value={newRoutineItemName}
                          onChange={(e) => setNewRoutineItemName(e.target.value)}
                          placeholder="New item..."
                          className="h-8 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddItemToRoutine(routine.id);
                            if (e.key === "Escape") {
                              setAddingItemToRoutine(null);
                              setNewRoutineItemName("");
                            }
                          }}
                        />
                        <Button size="sm" onClick={() => handleAddItemToRoutine(routine.id)}>
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setAddingItemToRoutine(null);
                            setNewRoutineItemName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {/* Quick add buttons when nothing is being added */}
                    {addingSectionTo !== routine.id && addingItemToRoutine !== routine.id && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => setAddingItemToRoutine(routine.id)}
                        >
                          <Plus className="h-3 w-3 mr-2" />
                          Add item
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => setAddingSectionTo(routine.id)}
                        >
                          <Plus className="h-3 w-3 mr-2" />
                          Add section
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Routine Dialog */}
      <Dialog open={addRoutineOpen} onOpenChange={setAddRoutineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Routine</DialogTitle>
          </DialogHeader>
          <Input
            value={newRoutineName}
            onChange={(e) => setNewRoutineName(e.target.value)}
            placeholder="Routine name..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddRoutine();
            }}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddRoutineOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRoutine}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Routine Dialog */}
      <Dialog open={!!editingRoutine} onOpenChange={(open) => !open && setEditingRoutine(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Routine</DialogTitle>
          </DialogHeader>
          <Input
            value={editRoutineName}
            onChange={(e) => setEditRoutineName(e.target.value)}
            placeholder="Routine name..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEditRoutine();
            }}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingRoutine(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditRoutine}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <Input
            value={editSectionName}
            onChange={(e) => setEditSectionName(e.target.value)}
            placeholder="Section name..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEditSection();
            }}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingSection(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSection}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Routine Confirmation */}
      <AlertDialog open={!!deleteRoutineId} onOpenChange={(open) => !open && setDeleteRoutineId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Routine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this routine? This will delete all sections and items within it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoutine}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
