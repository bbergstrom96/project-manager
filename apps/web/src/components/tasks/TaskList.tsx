"use client";

import { useEffect, useState } from "react";
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
import { useTaskStore } from "@/stores/taskStore";
import { TaskItem, TaskItemOverlay } from "./TaskItem";
import { api } from "@/lib/api";
import type { TaskFilters, TaskWithLabels } from "@proj-mgmt/shared";

interface TaskListProps {
  filters?: TaskFilters;
  hideProject?: boolean;
  hideDueDate?: boolean;
}

export function TaskList({ filters, hideProject, hideDueDate }: TaskListProps) {
  const { tasks, isLoading, isInitialized, fetchTasks, setFilters, setTasks } = useTaskStore();
  const [activeTask, setActiveTask] = useState<TaskWithLabels | null>(null);

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

  // Store handles deduplication - safe to call on every render
  useEffect(() => {
    if (filters) {
      setFilters(filters);
    } else {
      fetchTasks();
    }
  }, [JSON.stringify(filters), setFilters, fetchTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(reorderedTasks);

      try {
        await api.tasks.reorder(reorderedTasks.map((t) => t.id));
      } catch (error) {
        console.error("Failed to reorder tasks:", error);
        // Revert on error
        fetchTasks();
      }
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  if (isLoading || !isInitialized) {
    return (
      <div className="space-y-3 py-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-2">
            <div className="h-[18px] w-[18px] rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="divide-y">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              hideProject={hideProject}
              hideDueDate={hideDueDate}
              isDragging={activeTask?.id === task.id}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeTask ? <TaskItemOverlay task={activeTask} hideProject={hideProject} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
