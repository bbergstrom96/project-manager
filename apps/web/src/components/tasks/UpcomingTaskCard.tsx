"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { TaskWithLabels, Priority } from "@proj-mgmt/shared";

const priorityColors: Record<Priority, string> = {
  P1: "text-red-500 border-red-500",
  P2: "text-orange-500 border-orange-500",
  P3: "text-blue-500 border-blue-500",
  P4: "text-gray-400 border-gray-300",
};

interface UpcomingTaskCardProps {
  task: TaskWithLabels;
  onComplete: (taskId: string) => void;
  onUpdate: (task: TaskWithLabels) => void;
}

export function UpcomingTaskCard({
  task,
  onComplete,
  onUpdate,
}: UpcomingTaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.tasks.complete(task.id);
      onComplete(task.id);
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const handleSave = async () => {
    if (!editContent.trim() || editContent.trim() === task.content) {
      setIsEditing(false);
      setEditContent(task.content);
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await api.tasks.update(task.id, {
        content: editContent.trim(),
      });
      onUpdate(updated);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(task.content);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-card border rounded-lg p-3 space-y-2">
        <Input
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="text-sm"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              setEditContent(task.content);
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!editContent.trim() || isSubmitting}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleComplete}
          className={cn(
            "mt-0.5 h-[16px] w-[16px] flex-shrink-0 rounded-full border-2 transition-colors hover:bg-muted",
            priorityColors[task.priority]
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm">{task.content}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {task.description}
            </p>
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
