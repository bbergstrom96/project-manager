"use client";

import { useState } from "react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { Flag, MoreHorizontal, Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTaskStore } from "@/stores/taskStore";
import type { TaskWithLabels, Priority } from "@proj-mgmt/shared";

const priorityColors: Record<Priority, string> = {
  P1: "text-red-500 border-red-500",
  P2: "text-orange-500 border-orange-500",
  P3: "text-blue-500 border-blue-500",
  P4: "text-gray-400 border-gray-300",
};

function formatDueDate(date: Date): { text: string; className: string } {
  const d = new Date(date);
  if (isToday(d)) {
    return { text: "Today", className: "text-green-600" };
  }
  if (isTomorrow(d)) {
    return { text: "Tomorrow", className: "text-orange-500" };
  }
  if (isPast(d)) {
    return { text: format(d, "MMM d"), className: "text-red-500" };
  }
  return { text: format(d, "MMM d"), className: "text-muted-foreground" };
}

interface TaskItemProps {
  task: TaskWithLabels;
}

export function TaskItem({ task }: TaskItemProps) {
  const { completeTask, deleteTask } = useTaskStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleComplete = async () => {
    await completeTask(task.id);
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
  };

  const dueDate = task.dueDate ? formatDueDate(new Date(task.dueDate)) : null;

  return (
    <div
      className="group flex items-start gap-3 border-b py-3 px-2 hover:bg-muted/50 rounded-md transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={handleComplete}
        className={cn(
          "mt-0.5 h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 transition-colors hover:bg-muted",
          priorityColors[task.priority]
        )}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm">{task.content}</p>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {dueDate && (
            <span className={cn("flex items-center gap-1 text-xs", dueDate.className)}>
              <Calendar className="h-3 w-3" />
              {dueDate.text}
            </span>
          )}
          {task.project && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${task.project.color}20`, color: task.project.color }}
            >
              {task.project.name}
            </span>
          )}
          {task.labels.map(({ label }) => (
            <span
              key={label.id}
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${label.color}20`, color: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      </div>

      <div className={cn("flex items-center gap-1", !isHovered && "opacity-0")}>
        {task.priority !== "P4" && (
          <Flag
            className={cn("h-4 w-4", priorityColors[task.priority])}
            fill="currentColor"
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
