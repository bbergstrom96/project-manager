"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon, Plus } from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isTomorrow,
  isPast,
  isBefore,
  startOfDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/tasks/TaskForm";
import { DraggableTaskCard, TaskCardOverlay } from "@/components/tasks/DraggableTaskCard";
import { DroppableRow } from "@/components/tasks/DroppableRow";
import { api } from "@/lib/api";
import { useTaskStore } from "@/stores/taskStore";
import { cn } from "@/lib/utils";
import type { TaskWithLabels } from "@proj-mgmt/shared";

function getDayLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEEE");
}

// Custom collision detection - prefers task collisions for reordering, falls back to rows
const customCollisionDetection: CollisionDetection = (args) => {
  // First check for direct collisions with tasks (for reordering within same row)
  const pointerCollisions = pointerWithin(args);

  // Prefer task collisions over row collisions
  const taskCollisions = pointerCollisions.filter(
    (collision) => !String(collision.id).startsWith("row-")
  );

  if (taskCollisions.length > 0) {
    return taskCollisions;
  }

  // Fall back to row collisions (for moving between rows)
  const rowCollisions = pointerCollisions.filter(
    (collision) => String(collision.id).startsWith("row-")
  );

  if (rowCollisions.length > 0) {
    return rowCollisions;
  }

  return closestCenter(args);
};

export default function UpcomingPage() {
  const { invalidate: invalidateTaskStore } = useTaskStore();
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [tasks, setTasks] = useState<TaskWithLabels[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingTaskForDay, setAddingTaskForDay] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<TaskWithLabels | null>(null);
  const [activeTaskHeight, setActiveTaskHeight] = useState<number | null>(null);
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const today = useMemo(() => startOfDay(new Date()), []);

  // All days in the week
  const allWeekDays = useMemo(() => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
  }, [currentWeekStart]);

  // Only show today and future days
  const weekDays = useMemo(() => {
    return allWeekDays.filter((day) => !isBefore(day, today));
  }, [allWeekDays, today]);

  useEffect(() => {
    async function fetchWeekTasks() {
      setIsLoading(true);
      try {
        const allTasks = await api.tasks.list({});
        const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

        // Include tasks for this week AND overdue tasks
        const relevantTasks = allTasks.filter((task) => {
          if (!task.dueDate) return false;
          const taskDate = startOfDay(new Date(task.dueDate));
          // Include if in this week OR overdue (before today)
          return (taskDate >= currentWeekStart && taskDate <= weekEnd) || isBefore(taskDate, today);
        });

        setTasks(relevantTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWeekTasks();
  }, [currentWeekStart, today]);

  // Separate overdue tasks from regular day tasks
  const { tasksByDay, overdueTasks } = useMemo(() => {
    const grouped = new Map<string, TaskWithLabels[]>();
    const overdue: TaskWithLabels[] = [];

    weekDays.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      grouped.set(dateKey, []);
    });

    tasks.forEach((task) => {
      if (task.dueDate) {
        const taskDate = startOfDay(new Date(task.dueDate));
        const dateKey = format(taskDate, "yyyy-MM-dd");

        // Check if overdue (before today)
        if (isBefore(taskDate, today)) {
          overdue.push(task);
        } else {
          const dayTasks = grouped.get(dateKey);
          if (dayTasks) {
            dayTasks.push(task);
          }
        }
      }
    });

    return { tasksByDay: grouped, overdueTasks: overdue };
  }, [tasks, weekDays, today]);

  const navigateWeek = (delta: number) => {
    setCurrentWeekStart((prev) =>
      delta > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  const goToThisWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const toggleDayCollapse = (dateKey: string) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

  const handleTaskCreated = (task: TaskWithLabels) => {
    setTasks((prev) => [...prev, task]);
    setAddingTaskForDay(null);
    invalidateTaskStore();
  };

  const handleTaskCompleted = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    invalidateTaskStore();
  };

  const handleTaskUpdated = (updatedTask: TaskWithLabels) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    invalidateTaskStore();
  };

  const getTaskDateKey = useCallback((task: TaskWithLabels) => {
    if (!task.dueDate) return null;
    return format(new Date(task.dueDate), "yyyy-MM-dd");
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
      setActiveRow(getTaskDateKey(task));
      // Query DOM directly to get the actual stretched height
      const element = document.querySelector(`[data-task-id="${task.id}"]`);
      if (element) {
        setActiveTaskHeight(element.getBoundingClientRect().height);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const overId = String(over.id);
    let targetDateKey: string | null = null;

    if (overId.startsWith("row-")) {
      targetDateKey = overId.replace("row-", "");
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetDateKey = getTaskDateKey(overTask);
      }
    }

    if (targetDateKey && targetDateKey !== activeRow) {
      setActiveRow(targetDateKey);

      const taskId = active.id as string;
      const targetDay = weekDays.find(
        (d) => format(d, "yyyy-MM-dd") === targetDateKey
      );

      if (targetDay) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, dueDate: targetDay.toISOString() } : t
          )
        );
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    const taskId = active.id as string;
    const task = activeTask;
    const originalDateKey = task ? getTaskDateKey(task) : null;

    setActiveTask(null);
    setActiveTaskHeight(null);
    setActiveRow(null);

    if (!over || !task) return;

    const overId = String(over.id);
    let targetDateKey: string | null = null;

    if (overId.startsWith("row-")) {
      targetDateKey = overId.replace("row-", "");
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetDateKey = getTaskDateKey(overTask);
      }
    }

    // Moving to a different day
    if (targetDateKey && targetDateKey !== originalDateKey) {
      const targetDay = weekDays.find(
        (d) => format(d, "yyyy-MM-dd") === targetDateKey
      );

      if (targetDay) {
        try {
          await api.tasks.update(taskId, { dueDate: targetDay.toISOString() });
          // Invalidate task store so other pages (like Today) will refetch
          invalidateTaskStore();
        } catch (error) {
          console.error("Failed to update task:", error);
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? task : t))
          );
        }
      }
    }
    // Reordering within the same day
    else if (targetDateKey && targetDateKey === originalDateKey && overId !== taskId && !overId.startsWith("row-")) {
      const dayTasks = tasksByDay.get(targetDateKey) || [];
      const oldIndex = dayTasks.findIndex((t) => t.id === taskId);
      const newIndex = dayTasks.findIndex((t) => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reorderedDayTasks = arrayMove(dayTasks, oldIndex, newIndex);

        // Update local state
        setTasks((prev) => {
          const otherTasks = prev.filter((t) => getTaskDateKey(t) !== targetDateKey);
          return [...otherTasks, ...reorderedDayTasks];
        });

        // Persist reorder to API
        try {
          await api.tasks.reorder(reorderedDayTasks.map((t) => t.id));
        } catch (error) {
          console.error("Failed to reorder tasks:", error);
        }
      }
    }
  };

  const handleDragCancel = () => {
    if (activeTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === activeTask.id ? activeTask : t))
      );
    }
    setActiveTask(null);
    setActiveTaskHeight(null);
    setActiveRow(null);
  };

  const monthYear = format(currentWeekStart, "MMMM yyyy");

  return (
    <div className="h-full flex flex-col">
      <Header title="This Week" />

      {/* Week Navigation */}
      <div className="px-6 py-3 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-36 text-center">
              {monthYear}
            </span>
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={goToThisWeek}>
            This week
          </Button>
        </div>
      </div>

      {/* Vertical Kanban Board */}
      <div className="flex-1 overflow-y-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="space-y-4 max-w-5xl mx-auto">
            {/* Overdue Section */}
            {overdueTasks.length > 0 && (
              <div className="rounded-lg">
                {/* Overdue Header */}
                <button
                  onClick={() => toggleDayCollapse("overdue")}
                  className="flex items-center gap-2 mb-3 group"
                >
                  {collapsedDays.has("overdue") ? (
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-semibold px-2 py-0.5 rounded bg-red-500 text-white">
                    Overdue
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {overdueTasks.length}
                  </span>
                </button>

                {/* Overdue Content */}
                {!collapsedDays.has("overdue") && (
                  <div className="pl-6">
                    {isLoading ? (
                      <div className="flex gap-3">
                        {[...Array(2)].map((_, i) => (
                          <div
                            key={i}
                            className="w-64 h-24 bg-muted rounded-lg animate-pulse flex-shrink-0"
                          />
                        ))}
                      </div>
                    ) : (
                      <SortableContext
                        items={overdueTasks.map((t) => t.id)}
                        strategy={horizontalListSortingStrategy}
                      >
                        <div className="flex flex-wrap gap-3 items-stretch">
                          {overdueTasks.map((task) => (
                            <DraggableTaskCard
                              key={task.id}
                              task={task}
                              onComplete={handleTaskCompleted}
                              onUpdate={handleTaskUpdated}
                              isDragging={activeTask?.id === task.id}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    )}
                  </div>
                )}
              </div>
            )}

            {weekDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDay.get(dateKey) || [];
              const dayLabel = getDayLabel(day);
              const isCurrentDay = isToday(day);
              const isCollapsed = collapsedDays.has(dateKey);
              const isActiveDropTarget = activeRow === dateKey;
              const isAddingForThisDay = addingTaskForDay === dateKey;

              return (
                <DroppableRow
                  key={dateKey}
                  id={`row-${dateKey}`}
                  isOver={isActiveDropTarget}
                >
                  <div className="rounded-lg">
                    {/* Row Header */}
                    <button
                      onClick={() => toggleDayCollapse(dateKey)}
                      className="flex items-center gap-2 mb-3 group"
                    >
                      {isCollapsed ? (
                        <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span
                        className={cn(
                          "text-sm font-semibold px-2 py-0.5 rounded",
                          isCurrentDay
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {dayLabel}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(day, "MMM d")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {dayTasks.length}
                      </span>
                    </button>

                    {/* Row Content */}
                    {!isCollapsed && (
                      <div className="pl-6">
                        {isLoading ? (
                          <div className="flex gap-3">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="w-64 h-24 bg-muted rounded-lg animate-pulse flex-shrink-0"
                              />
                            ))}
                          </div>
                        ) : (
                          <SortableContext
                            items={dayTasks.map((t) => t.id)}
                            strategy={horizontalListSortingStrategy}
                          >
                            <div className="flex flex-wrap gap-3 items-stretch">
                              {dayTasks.map((task) => (
                                <DraggableTaskCard
                                  key={task.id}
                                  task={task}
                                  onComplete={handleTaskCompleted}
                                  onUpdate={handleTaskUpdated}
                                  isDragging={activeTask?.id === task.id}
                                />
                              ))}

                              {isAddingForThisDay ? (
                                <div className="w-64 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg p-3 flex-shrink-0">
                                  <TaskForm
                                    defaultDueDate={day.toISOString()}
                                    onClose={() => setAddingTaskForDay(null)}
                                    onCreated={handleTaskCreated}
                                    compact
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={() => setAddingTaskForDay(dateKey)}
                                  className="flex items-center justify-center gap-2 w-64 min-h-[4.5rem] border-2 border-dashed border-muted-foreground/25 rounded-lg text-sm text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors flex-shrink-0"
                                >
                                  <Plus className="h-4 w-4" />
                                  New task
                                </button>
                              )}
                            </div>
                          </SortableContext>
                        )}
                      </div>
                    )}
                  </div>
                </DroppableRow>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCardOverlay task={activeTask} height={activeTaskHeight} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
