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
  type DragStartEvent,
  type DragEndEvent,
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
}

function SectionItem({ section, tasks, projectId, onTaskCreated, isDragging: isDraggingProp, isReorderMode, onRegisterRef }: SectionItemProps) {
  const { updateSection, deleteSection } = useSectionStore();
  const { reorderTasks } = useTaskStore();
  const [activeTask, setActiveTask] = useState<TaskWithLabels | null>(null);

  const taskSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleTaskDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleTaskDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
      await reorderTasks(reorderedTasks.map((t) => t.id));
    }
  };

  const handleTaskDragCancel = () => {
    setActiveTask(null);
  };
  const [isOpen, setIsOpen] = useState(true);
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
  } = useSortable({ id: section.id });

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
        <div className="pl-6">
          <DndContext
            sensors={taskSensors}
            collisionDetection={closestCorners}
            onDragStart={handleTaskDragStart}
            onDragEnd={handleTaskDragEnd}
            onDragCancel={handleTaskDragCancel}
          >
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.length > 0 && (
                <div className="divide-y">
                  {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} hideProject />
                  ))}
                </div>
              )}
            </SortableContext>
            <DragOverlay>
              {activeTask ? (
                <TaskItemOverlay task={activeTask} hideProject />
              ) : null}
            </DragOverlay>
          </DndContext>

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
}

function UnsectionedTasks({ tasks, projectId, onTaskCreated }: UnsectionedTasksProps) {
  const { reorderTasks } = useTaskStore();
  const [showAddTask, setShowAddTask] = useState(false);
  const [hasOpenedForm, setHasOpenedForm] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskWithLabels | null>(null);
  const formKey = useRef(0);

  const taskSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOpenForm = () => {
    formKey.current += 1;
    setHasOpenedForm(true);
    setShowAddTask(true);
  };

  const handleTaskDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleTaskDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
      await reorderTasks(reorderedTasks.map((t) => t.id));
    }
  };

  const handleTaskDragCancel = () => {
    setActiveTask(null);
  };

  // If there are no unsectioned tasks and no sections exist yet, show nothing special
  // But we still want the add task button
  return (
    <div className="mb-4">
      <DndContext
        sensors={taskSensors}
        collisionDetection={closestCorners}
        onDragStart={handleTaskDragStart}
        onDragEnd={handleTaskDragEnd}
        onDragCancel={handleTaskDragCancel}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length > 0 && (
            <div className="divide-y">
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} hideProject />
              ))}
            </div>
          )}
        </SortableContext>
        <DragOverlay>
          {activeTask ? (
            <TaskItemOverlay task={activeTask} hideProject />
          ) : null}
        </DragOverlay>
      </DndContext>

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
  const [activeSection, setActiveSection] = useState<{ section: Section; taskCount: number; index: number } | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
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

  const handleDragStart = (event: DragStartEvent) => {
    const section = sections.find((s) => s.id === event.active.id);
    if (section) {
      const taskCount = tasksBySection.get(section.id)?.length || 0;
      const index = sections.findIndex((s) => s.id === section.id);

      // Get positions to calculate spacer
      const sectionElement = sectionRefs.current.get(section.id);
      const containerElement = containerRef.current;

      if (sectionElement && containerElement) {
        const sectionRect = sectionElement.getBoundingClientRect();
        const containerRect = containerElement.getBoundingClientRect();

        // Section's position relative to the container (not viewport)
        const sectionOffsetInContainer = sectionRect.top - containerRect.top;

        // Where it will be after collapsing (index * collapsed height)
        const collapsedOffset = index * COLLAPSED_SECTION_HEIGHT;

        // Spacer = difference between original position and collapsed position
        setSpacerHeight(Math.max(0, sectionOffsetInContainer - collapsedOffset));
      }

      setActiveSection({ section, taskCount, index });
      setIsReorderMode(true);
    }
  };

  const registerRef = (id: string, el: HTMLDivElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el);
    } else {
      sectionRefs.current.delete(id);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSection(null);
    setIsReorderMode(false);
    setSpacerHeight(0);

    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedSections = arrayMove(sections, oldIndex, newIndex);
      await reorderSections(reorderedSections.map((s) => s.id));
    }
  };

  const handleDragCancel = () => {
    setActiveSection(null);
    setIsReorderMode(false);
    setSpacerHeight(0);
  };

  return (
    <div ref={containerRef}>
      {/* Unsectioned tasks - hidden in reorder mode */}
      {!isReorderMode && (
        <UnsectionedTasks
          tasks={unsectionedTasks}
          projectId={projectId}
          onTaskCreated={onTaskCreated}
        />
      )}

      {/* Sections with drag-and-drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {/* Spacer to position collapsed sections around drag point */}
          {isReorderMode && <div style={{ height: spacerHeight }} />}
          {sections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              tasks={tasksBySection.get(section.id) || []}
              projectId={projectId}
              onTaskCreated={onTaskCreated}
              isDragging={activeSection?.section.id === section.id}
              isReorderMode={isReorderMode}
              onRegisterRef={(el) => registerRef(section.id, el)}
            />
          ))}
        </SortableContext>
        <DragOverlay>
          {activeSection ? (
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
