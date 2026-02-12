"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { TaskEditPopover } from "./TaskEditPopover";
import { RichTextContent } from "@/components/ui/rich-text-editor";
import { api } from "@/lib/api";
import type { TaskWithLabels, Priority } from "@proj-mgmt/shared";

const priorityColors: Record<Priority, string> = {
  P1: "text-red-500 border-red-500",
  P2: "text-orange-500 border-orange-500",
  P3: "text-blue-500 border-blue-500",
  P4: "text-gray-400 border-gray-300",
};

interface DraggableTaskCardProps {
  task: TaskWithLabels;
  onComplete: (taskId: string) => void;
  onUpdate: (task: TaskWithLabels) => void;
  isDragging?: boolean;
}

export function DraggableTaskCard({
  task,
  onComplete,
  onUpdate,
  isDragging: isDraggingProp,
}: DraggableTaskCardProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingSortable,
  } = useSortable({ id: task.id });

  const isDragging = isDraggingProp || isDraggingSortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.tasks.complete(task.id);
      onComplete(task.id);
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  return (
    <TaskEditPopover
      task={task}
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
      onUpdate={onUpdate}
      onComplete={onComplete}
    >
      <div
        ref={setNodeRef}
        style={style}
        data-task-id={task.id}
        {...attributes}
        {...listeners}
        className={cn(
          "w-64 min-h-[4.5rem] flex-shrink-0 bg-[#252830] border border-[#353a45] rounded-lg p-3 hover:bg-[#2d323d] cursor-grab active:cursor-grabbing transition-colors group touch-none",
          isDragging && "opacity-50 shadow-lg"
        )}
      >
        <div className="flex items-start gap-2">
          <button
            onClick={handleComplete}
            onPointerDown={(e) => e.stopPropagation()}
            className={cn(
              "mt-0.5 h-[16px] w-[16px] flex-shrink-0 rounded-full border-2 transition-colors hover:bg-muted",
              priorityColors[task.priority]
            )}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-100">{task.content}</p>
            {task.description && (
              <div
                className="mt-1 max-h-[3.5rem] overflow-y-auto"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <RichTextContent content={task.description} className="rich-text-content" />
              </div>
            )}
            {/* Labels */}
            {task.labels.length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
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
            )}
            {task.project && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: task.project.color }}
                />
                {task.project.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </TaskEditPopover>
  );
}

// Overlay shown while dragging
export function TaskCardOverlay({ task, height }: { task: TaskWithLabels; height?: number | null }) {
  return (
    <div
      className="w-64 flex-shrink-0 bg-[#252830] border border-[#353a45] rounded-lg p-3 shadow-2xl"
      style={height ? { height } : undefined}
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "mt-0.5 h-[16px] w-[16px] flex-shrink-0 rounded-full border-2",
            priorityColors[task.priority]
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-100">{task.content}</p>
          {task.description && (
            <div className="mt-1 max-h-[3.5rem] overflow-hidden">
              <RichTextContent content={task.description} className="rich-text-content" />
            </div>
          )}
          {task.labels.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
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
          )}
          {task.project && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: task.project.color }}
              />
              {task.project.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
