"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Flag,
  Tag,
  FolderOpen,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTaskStore } from "@/stores/taskStore";
import { useProjectStore } from "@/stores/projectStore";
import { useLabelStore } from "@/stores/labelStore";
import { useUIStore } from "@/stores/uiStore";
import type { Priority, TaskWithLabels } from "@proj-mgmt/shared";

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "P1", label: "Priority 1", color: "text-red-500" },
  { value: "P2", label: "Priority 2", color: "text-orange-500" },
  { value: "P3", label: "Priority 3", color: "text-blue-500" },
  { value: "P4", label: "No priority", color: "text-zinc-400" },
];

interface TaskFormProps {
  projectId?: string;
  sectionId?: string;
  areaId?: string;
  defaultDueDate?: string;
  onClose?: () => void;
  onCreated?: (task: TaskWithLabels) => void;
  compact?: boolean;
}

export function TaskForm({ projectId: defaultProjectId, sectionId: defaultSectionId, areaId: defaultAreaId, defaultDueDate, onClose, onCreated, compact }: TaskFormProps) {
  const { addTask, fetchTasks } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const { labels, fetchLabels } = useLabelStore();
  const { setAddTaskOpen } = useUIStore();

  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("P4");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    defaultDueDate ? new Date(defaultDueDate) : undefined
  );
  const [projectId, setProjectId] = useState<string | undefined>(defaultProjectId);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (projects.length === 0) fetchProjects();
    if (labels.length === 0) fetchLabels();
  }, [projects.length, labels.length, fetchProjects, fetchLabels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const task = await addTask({
        content: content.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate?.toISOString(),
        projectId,
        sectionId: projectId ? defaultSectionId : undefined, // Only assign section if in a project
        areaId: !projectId ? defaultAreaId : undefined, // Only assign area if no project
        labelIds: labelIds.length > 0 ? labelIds : undefined,
      });

      // Clear only content and description, keep other settings for quick multi-task entry
      setContent("");
      setDescription("");

      // Refocus input for adding another task
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);

      if (onCreated) {
        onCreated(task);
      } else {
        fetchTasks();
      }
      // Don't close the form - keep it open for adding more tasks
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      setAddTaskOpen(false);
    }
  };

  const toggleLabel = (labelId: string) => {
    setLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const selectedProject = projects.find((p) => p.id === projectId);
  const selectedPriority = priorities.find((p) => p.value === priority)!;

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          ref={inputRef}
          placeholder="Task name"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
          className="text-sm"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              handleCancel();
            }
            if (e.key === "Enter" && !content.trim()) {
              e.preventDefault();
              handleCancel();
            }
          }}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!content.trim() || isSubmitting}>
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#3d3d3d] rounded-lg bg-[#1e1e1e] overflow-hidden">
      {/* Content area */}
      <div className="p-3 space-y-1">
        <Input
          ref={inputRef}
          placeholder="Task name"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
          className="border-0 p-0 text-sm font-medium focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none placeholder:text-zinc-500 bg-transparent h-auto"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              handleCancel();
            }
            if (e.key === "Enter" && !content.trim()) {
              e.preventDefault();
              handleCancel();
            }
          }}
        />
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            // Auto-resize
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) {
              e.preventDefault();
              if (content.trim()) {
                handleSubmit(e as unknown as React.FormEvent);
              }
            }
          }}
          className="border-0 p-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none placeholder:text-zinc-600 bg-transparent resize-none min-h-[20px] overflow-hidden"
          rows={1}
        />
      </div>

      {/* Icon toolbar */}
      <div className="px-3 pb-3 flex items-center gap-1">
        {/* Due date */}
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "p-1.5 rounded border border-[#3d3d3d] hover:bg-[#2d2d2d] transition-colors",
                dueDate && "border-green-600 text-green-500"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#1e1e1e] border-[#3d3d3d]" align="start">
            <DatePicker date={dueDate} onSelect={setDueDate} onClose={() => setDatePickerOpen(false)} />
          </PopoverContent>
        </Popover>

        {/* Priority */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "p-1.5 rounded border border-[#3d3d3d] hover:bg-[#2d2d2d] transition-colors",
                priority !== "P4" && selectedPriority.color.replace("text-", "border-"),
                priority !== "P4" && selectedPriority.color
              )}
            >
              <Flag className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1" align="start">
            {priorities.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded hover:bg-muted",
                  priority === p.value && "bg-muted"
                )}
              >
                <Flag className={cn("h-3 w-3", p.color)} />
                {p.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Labels */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "p-1.5 rounded border border-[#3d3d3d] hover:bg-[#2d2d2d] transition-colors",
                labelIds.length > 0 && "border-primary text-primary"
              )}
            >
              <Tag className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1" align="start">
            {labels.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                No labels
              </p>
            ) : (
              labels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded hover:bg-muted"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="flex-1 text-left">{label.name}</span>
                  {labelIds.includes(label.id) && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </button>
              ))
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected labels display */}
      {labelIds.length > 0 && (
        <div className="px-3 pb-3 flex flex-wrap gap-1">
          {labelIds.map((labelId) => {
            const label = labels.find((l) => l.id === labelId);
            if (!label) return null;
            return (
              <span
                key={label.id}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${label.color}20`, color: label.color }}
              >
                {label.name}
              </span>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[#3d3d3d] flex items-center justify-between bg-[#252525]">
        {/* Project selector */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              {selectedProject ? (
                <>
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: selectedProject.color }}
                  />
                  {selectedProject.name}
                </>
              ) : (
                <>
                  <FolderOpen className="h-3.5 w-3.5" />
                  Inbox
                </>
              )}
              <span className="text-zinc-600">▾</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1" align="start">
            <button
              type="button"
              onClick={() => setProjectId(undefined)}
              className={cn(
                "flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded hover:bg-muted",
                !projectId && "bg-muted"
              )}
            >
              <FolderOpen className="h-3 w-3" />
              Inbox
            </button>
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setProjectId(project.id)}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded hover:bg-muted",
                  projectId === project.id && "bg-muted"
                )}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add task"}
          </Button>
        </div>
      </div>
    </form>
  );
}
