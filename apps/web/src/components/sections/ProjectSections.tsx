"use client";

import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskItem, TaskItemOverlay } from "@/components/tasks/TaskItem";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useSectionStore } from "@/stores/sectionStore";
import { useTaskStore } from "@/stores/taskStore";
import type { Section, TaskWithLabels } from "@proj-mgmt/shared";

interface SectionItemProps {
  section: Section;
  tasks: TaskWithLabels[];
  projectId: string;
  onTaskCreated?: (task: TaskWithLabels) => void;
  isDragging?: boolean;
  isReorderMode?: boolean;
  onRegisterRef?: (el: HTMLDivElement | null) => void;
  isDropTarget?: boolean;
}

function SectionItem({ section, tasks, projectId, onTaskCreated, isDragging: isDraggingProp, isReorderMode, onRegisterRef, isDropTarget }: SectionItemProps) {
  const { updateSection, deleteSection } = useSectionStore();
  const [isOpen, setIsOpen] = useState(true);

  // Set up this section as a drop target for tasks
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `section-drop-${section.id}`,
    data: { type: "section", sectionId: section.id },
  });
  const [showAddTask, setShowAddTask] = useState(false);
  const [hasOpenedForm, setHasOpenedForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);
  const editInputRef = useRef<HTMLInputElement>(null);
  const formKey = useRef(0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingSortable,
  } = useSortable({ id: `section-${section.id}` });

  const isDragging = isDraggingProp || isDraggingSortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Combined ref for sortable and parent tracking
  const combinedRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    onRegisterRef?.(el);
  };

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleOpenForm = () => {
    formKey.current += 1;
    setHasOpenedForm(true);
    setShowAddTask(true);
  };

  const handleSaveEdit = async () => {
    if (editName.trim() && editName.trim() !== section.name) {
      await updateSection(section.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm(`Delete section "${section.name}"? Tasks in this section will be moved to no section.`)) {
      await deleteSection(section.id);
    }
  };

  // In reorder mode, only show the header
  const showContent = !isReorderMode && isOpen;

  return (
    <div
      ref={combinedRef}
      style={style}
      className={cn(
        isReorderMode ? "mb-3 py-1 px-2 rounded-md bg-muted/30" : "mb-4",
        isDragging && "opacity-0"
      )}
    >
      {/* Section header - draggable */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "group flex items-center gap-2 cursor-grab active:cursor-grabbing",
          !isReorderMode && "mb-2"
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isReorderMode) {
              setIsOpen(!isOpen);
            }
          }}
          className="p-0.5 hover:bg-muted rounded"
        >
          {showContent ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {isEditing && !isReorderMode ? (
          <Input
            ref={editInputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit();
              if (e.key === "Escape") {
                setEditName(section.name);
                setIsEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-7 text-sm font-semibold py-0 px-1"
          />
        ) : (
          <span className="font-semibold text-sm">{section.name}</span>
        )}

        <span className="text-xs text-muted-foreground">{tasks.length}</span>

        <div className="flex-1" />

        {!isReorderMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Tasks - hidden in reorder mode */}
      {showContent && (
        <div
          ref={setDroppableRef}
          className={cn(
            "pl-5 min-h-[40px] rounded-md transition-colors",
            (isOver || isDropTarget) && "bg-muted/50"
          )}
        >
          {tasks.length > 0 && (
            <div className="divide-y">
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} hideProject />
              ))}
            </div>
          )}

          {/* Add task form/button */}
          <div className="mt-2">
            {hasOpenedForm && (
              <div
                className={cn(
                  "transition-all duration-200 ease-out overflow-hidden",
                  showAddTask
                    ? "opacity-100 max-h-[500px]"
                    : "opacity-0 max-h-0 pointer-events-none"
                )}
              >
                <TaskForm
                  key={formKey.current}
                  projectId={projectId}
                  sectionId={section.id}
                  onClose={() => setShowAddTask(false)}
                  onCreated={onTaskCreated}
                />
              </div>
            )}

            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-muted-foreground transition-all duration-200",
                showAddTask && "opacity-0 h-0 overflow-hidden pointer-events-none"
              )}
              onClick={handleOpenForm}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add task
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Overlay shown while dragging a section
function SectionItemOverlay({ section, taskCount }: { section: Section; taskCount: number }) {
  return (
    <div className="flex items-center gap-2 bg-[#2d2d2d] rounded-md shadow-lg border border-[#3d3d3d] px-3 py-2">
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      <span className="font-semibold text-sm">{section.name}</span>
      <span className="text-xs text-muted-foreground">{taskCount}</span>
    </div>
  );
}

interface UnsectionedTasksProps {
  tasks: TaskWithLabels[];
  projectId: string;
  onTaskCreated?: (task: TaskWithLabels) => void;
  isDropTarget?: boolean;
}

function UnsectionedTasks({ tasks, projectId, onTaskCreated, isDropTarget }: UnsectionedTasksProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [hasOpenedForm, setHasOpenedForm] = useState(false);
  const formKey = useRef(0);

  // Set up as a drop target for tasks (null sectionId)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: "section-drop-unsectioned",
    data: { type: "section", sectionId: null },
  });

  const handleOpenForm = () => {
    formKey.current += 1;
    setHasOpenedForm(true);
    setShowAddTask(true);
  };

  return (
    <div
      ref={setDroppableRef}
      className={cn(
        "pl-5 mb-4 min-h-[40px] rounded-md transition-colors",
        (isOver || isDropTarget) && "bg-muted/50"
      )}
    >
      {tasks.length > 0 && (
        <div className="divide-y">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} hideProject />
          ))}
        </div>
      )}

      {/* Add task form/button for unsectioned tasks */}
      <div className="mt-2">
        {hasOpenedForm && (
          <div
            className={cn(
              "transition-all duration-200 ease-out overflow-hidden",
              showAddTask
                ? "opacity-100 max-h-[500px]"
                : "opacity-0 max-h-0 pointer-events-none"
            )}
          >
            <TaskForm
              key={formKey.current}
              projectId={projectId}
              onClose={() => setShowAddTask(false)}
              onCreated={onTaskCreated}
            />
          </div>
        )}

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground transition-all duration-200",
            showAddTask && "opacity-0 h-0 overflow-hidden pointer-events-none"
          )}
          onClick={handleOpenForm}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add task
        </Button>
      </div>
    </div>
  );
}

interface AddSectionButtonProps {
  projectId: string;
}

function AddSectionButton({ projectId }: AddSectionButtonProps) {
  const { addSection } = useSectionStore();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSubmit = async () => {
    if (name.trim()) {
      await addSection(projectId, name.trim());
      setName("");
      setIsAdding(false);
    }
  };

  if (isAdding) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Section name"
          className="h-8"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") {
              setName("");
              setIsAdding(false);
            }
          }}
        />
        <Button size="sm" onClick={handleSubmit} disabled={!name.trim()}>
          Add
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setName("");
            setIsAdding(false);
          }}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      className="text-muted-foreground mb-4"
      onClick={() => setIsAdding(true)}
    >
      <Plus className="mr-2 h-4 w-4" />
      Add section
    </Button>
  );
}

interface ProjectSectionsProps {
  projectId: string;
  tasks: TaskWithLabels[];
  onTaskCreated?: (task: TaskWithLabels) => void;
}

// Approximate height of a collapsed section (header + margin)
const COLLAPSED_SECTION_HEIGHT = 48; // ~36px content + 12px margin

export function ProjectSections({ projectId, tasks, onTaskCreated }: ProjectSectionsProps) {
  const { sections, fetchSections, clearSections, reorderSections } = useSectionStore();
  const { updateTask, reorderTasks } = useTaskStore();
  const [activeSection, setActiveSection] = useState<{ section: Section; taskCount: number; index: number } | null>(null);
  const [activeTask, setActiveTask] = useState<TaskWithLabels | null>(null);
  const [overSectionId, setOverSectionId] = useState<string | null | undefined>(undefined);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Single sensor set for unified DndContext
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
    fetchSections(projectId);
    return () => clearSections();
  }, [projectId, fetchSections, clearSections]);

  // Group tasks by section
  const unsectionedTasks = tasks.filter((t) => !t.sectionId);
  const tasksBySection = new Map<string, TaskWithLabels[]>();

  sections.forEach((section) => {
    tasksBySection.set(section.id, []);
  });

  tasks.forEach((task) => {
    if (task.sectionId && tasksBySection.has(task.sectionId)) {
      tasksBySection.get(task.sectionId)!.push(task);
    }
  });

  // All sortable IDs - tasks use their IDs, sections use "section-" prefix
  const allTaskIds = tasks.map((t) => t.id);
  const allSectionIds = sections.map((s) => `section-${s.id}`);

  const registerRef = (id: string, el: HTMLDivElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el);
    } else {
      sectionRefs.current.delete(id);
    }
  };

  // === Unified drag handlers ===
  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;

    // Check if dragging a section (prefixed with "section-")
    if (activeId.startsWith("section-")) {
      const sectionId = activeId.replace("section-", "");
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        const taskCount = tasksBySection.get(section.id)?.length || 0;
        const index = sections.findIndex((s) => s.id === sectionId);

        // Get positions to calculate spacer
        const sectionElement = sectionRefs.current.get(sectionId);
        const containerElement = containerRef.current;

        if (sectionElement && containerElement) {
          const sectionRect = sectionElement.getBoundingClientRect();
          const containerRect = containerElement.getBoundingClientRect();
          const sectionOffsetInContainer = sectionRect.top - containerRect.top;
          const collapsedOffset = index * COLLAPSED_SECTION_HEIGHT;
          setSpacerHeight(Math.max(0, sectionOffsetInContainer - collapsedOffset));
        }

        setActiveSection({ section, taskCount, index });
        setIsReorderMode(true);
      }
    } else {
      // Dragging a task
      const task = tasks.find((t) => t.id === activeId);
      if (task) {
        setActiveTask(task);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    // Only track section for task drags
    if (!activeTask || !over) {
      setOverSectionId(undefined);
      return;
    }

    const overId = over.id as string;

    // Check if we're over a section droppable
    if (overId.startsWith("section-drop-")) {
      const sectionId = overId === "section-drop-unsectioned" ? null : overId.replace("section-drop-", "");
      setOverSectionId(sectionId);
    } else if (!overId.startsWith("section-")) {
      // We're over a task - find which section that task belongs to
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        setOverSectionId(overTask.sectionId);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;

    // Handle section drag end
    if (activeId.startsWith("section-")) {
      setActiveSection(null);
      setIsReorderMode(false);
      setSpacerHeight(0);

      if (!over || active.id === over.id) return;

      const oldSectionId = activeId.replace("section-", "");
      const newSectionId = (over.id as string).replace("section-", "");

      const oldIndex = sections.findIndex((s) => s.id === oldSectionId);
      const newIndex = sections.findIndex((s) => s.id === newSectionId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedSections = arrayMove(sections, oldIndex, newIndex);
        await reorderSections(reorderedSections.map((s) => s.id));
      }
      return;
    }

    // Handle task drag end
    const draggedTask = activeTask;
    setActiveTask(null);
    setOverSectionId(undefined);

    if (!over || !draggedTask) return;

    const overId = over.id as string;

    // Determine target section
    let targetSectionId: string | null;
    if (overId.startsWith("section-drop-")) {
      targetSectionId = overId === "section-drop-unsectioned" ? null : overId.replace("section-drop-", "");
    } else if (overId.startsWith("section-")) {
      // Dropped on a section header - ignore
      return;
    } else {
      // Dropped on a task - get that task's section
      const overTask = tasks.find((t) => t.id === overId);
      targetSectionId = overTask?.sectionId ?? null;
    }

    const sourceSectionId = draggedTask.sectionId;

    // Cross-section move
    if (targetSectionId !== sourceSectionId) {
      await updateTask(draggedTask.id, { sectionId: targetSectionId });
      return;
    }

    // Same section reorder
    if (active.id === over.id) return;

    const sectionTasks = targetSectionId === null
      ? unsectionedTasks
      : tasksBySection.get(targetSectionId) || [];

    const oldIndex = sectionTasks.findIndex((t) => t.id === active.id);
    const newIndex = sectionTasks.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(sectionTasks, oldIndex, newIndex);
      await reorderTasks(reordered.map((t) => t.id));
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    setActiveSection(null);
    setOverSectionId(undefined);
    setIsReorderMode(false);
    setSpacerHeight(0);
  };

  return (
    <div ref={containerRef}>
      {/* Single unified DndContext for both tasks and sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Unsectioned tasks - hidden in reorder mode */}
        {!isReorderMode && (
          <SortableContext
            items={unsectionedTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <UnsectionedTasks
              tasks={unsectionedTasks}
              projectId={projectId}
              onTaskCreated={onTaskCreated}
              isDropTarget={overSectionId === null}
            />
          </SortableContext>
        )}

        {/* Sections with their own SortableContexts */}
        <SortableContext
          items={allSectionIds}
          strategy={verticalListSortingStrategy}
        >
          {/* Spacer to position collapsed sections around drag point */}
          {isReorderMode && <div style={{ height: spacerHeight }} />}
          {sections.map((section) => {
            const sectionTasks = tasksBySection.get(section.id) || [];
            return (
              <SortableContext
                key={section.id}
                items={sectionTasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <SectionItem
                  section={section}
                  tasks={sectionTasks}
                  projectId={projectId}
                  onTaskCreated={onTaskCreated}
                  isDragging={activeSection?.section.id === section.id}
                  isReorderMode={isReorderMode}
                  onRegisterRef={(el) => registerRef(section.id, el)}
                  isDropTarget={overSectionId === section.id}
                />
              </SortableContext>
            );
          })}
        </SortableContext>

        {/* Drag overlays */}
        <DragOverlay>
          {activeTask ? (
            <TaskItemOverlay task={activeTask} hideProject />
          ) : activeSection ? (
            <SectionItemOverlay
              section={activeSection.section}
              taskCount={activeSection.taskCount}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add section button - hidden in reorder mode */}
      {!isReorderMode && <AddSectionButton projectId={projectId} />}
    </div>
  );
}
