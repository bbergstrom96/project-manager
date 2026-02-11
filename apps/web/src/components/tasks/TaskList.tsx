"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { TaskItem } from "./TaskItem";
import type { TaskFilters } from "@proj-mgmt/shared";

interface TaskListProps {
  filters?: TaskFilters;
}

export function TaskList({ filters }: TaskListProps) {
  const { tasks, isLoading, fetchTasks, setFilters } = useTaskStore();

  useEffect(() => {
    if (filters) {
      setFilters(filters);
    } else {
      fetchTasks();
    }
  }, [filters, setFilters, fetchTasks]);

  if (isLoading) {
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
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-lg font-medium">All done!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No tasks here. Enjoy your free time!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
