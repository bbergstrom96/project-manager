"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Flag, Calendar as CalendarIcon, Tag, Check, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLabelStore } from "@/stores/labelStore";
import { useProjectStore } from "@/stores/projectStore";
import { api } from "@/lib/api";
import type { TaskWithLabels, Priority } from "@proj-mgmt/shared";

const priorityColors: Record<Priority, string> = {
  P1: "text-red-500",
  P2: "text-orange-500",
  P3: "text-blue-500",
  P4: "text-zinc-400",
};

const priorityBorderColors: Record<Priority, string> = {
  P1: "border-red-500",
  P2: "border-orange-500",
  P3: "border-blue-500",
  P4: "border-zinc-500",
};

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "P1", label: "Priority 1", color: "text-red-500" },
  { value: "P2", label: "Priority 2", color: "text-orange-500" },
  { value: "P3", label: "Priority 3", color: "text-blue-500" },
  { value: "P4", label: "Priority 4", color: "text-gray-400" },
];

interface TaskEditPopoverProps {
  task: TaskWithLabels;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (task: TaskWithLabels) => void;
  onComplete: (taskId: string) => void;
  children: React.ReactNode;
}

export function TaskEditPopover({
  task,
  open,
  onOpenChange,
  onUpdate,
  onComplete,
  children,
}: TaskEditPopoverProps) {
  const { labels, fetchLabels } = useLabelStore();
  const { projects, fetchProjects } = useProjectStore();

  const [content, setContent] = useState(task.content);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );
  const [labelIds, setLabelIds] = useState<string[]>(
    task.labels.map(({ label }) => label.id)
  );
  const [projectId, setProjectId] = useState<string | null>(task.projectId);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [priorityPickerOpen, setPriorityPickerOpen] = useState(false);

  // Initialize form state only when popover opens
  useEffect(() => {
    if (open) {
      setContent(task.content);
      setDescription(task.description || "");
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setLabelIds(task.labels.map(({ label }) => label.id));
      setProjectId(task.projectId);
    }
    // Only depend on `open` changing - we want to reset state when opening, not when task changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Fetch labels and projects separately so it doesn't reset form state
  useEffect(() => {
    if (open) {
      if (labels.length === 0) fetchLabels();
      if (projects.length === 0) fetchProjects();
    }
  }, [open, labels.length, projects.length, fetchLabels, fetchProjects]);

  const handleSave = async () => {
    if (!content.trim()) return;

    try {
      const updated = await api.tasks.update(task.id, {
        content: content.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate?.toISOString() || undefined,
        labelIds,
        projectId: projectId ?? undefined,
      });
      onUpdate(updated);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      handleSave();
    }
    onOpenChange(open);
  };

  const handleComplete = async () => {
    try {
      await api.tasks.complete(task.id);
      onComplete(task.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to complete task:", error);
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

  return (
    <Popover open={open} onOpenChange={handleClose}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="w-72 p-0 bg-[#1e1e1e] border-[#3d3d3d]"
      >
        {/* Title with checkbox */}
        <div className="flex items-start gap-2 p-3 border-b border-[#3d3d3d]">
          <button
            onClick={handleComplete}
            className={cn(
              "mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2 transition-colors hover:bg-zinc-700",
              priorityBorderColors[priority]
            )}
          />
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Task name"
            className="text-sm font-medium bg-transparent border-0 p-0 h-auto focus-visible:ring-0 text-zinc-100"
          />
        </div>

        {/* Description */}
        <div className="p-3 border-b border-[#3d3d3d]">
          <RichTextEditor
            content={description}
            onChange={setDescription}
            onSubmit={() => handleClose(false)}
            placeholder="Add description..."
          />
        </div>

        {/* Properties */}
        <div className="p-2 space-y-0.5 text-xs">
          {/* Date */}
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-[#2d2d2d] transition-colors text-left">
                <CalendarIcon className="h-3.5 w-3.5 text-zinc-500" />
                <span
                  className={cn(
                    dueDate ? "text-green-500" : "text-zinc-500"
                  )}
                >
                  {dueDate ? format(dueDate, "MMM d") : "No date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#1e1e1e] border-[#3d3d3d]" align="start" side="left">
              <DatePicker date={dueDate} onSelect={setDueDate} onClose={() => setDatePickerOpen(false)} />
            </PopoverContent>
          </Popover>

          {/* Priority */}
          <Popover open={priorityPickerOpen} onOpenChange={setPriorityPickerOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-[#2d2d2d] transition-colors text-left">
                <Flag className={cn("h-3.5 w-3.5", priorityColors[priority])} />
                <span className={priorityColors[priority]}>
                  Priority {priority.slice(1)}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-1" align="start" side="left">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => { setPriority(p.value); setPriorityPickerOpen(false); }}
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

          {/* Project */}
          <Popover open={projectPickerOpen} onOpenChange={setProjectPickerOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-[#2d2d2d] transition-colors text-left">
                {selectedProject ? (
                  <>
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: selectedProject.color }}
                    />
                    <span className="text-zinc-300">{selectedProject.name}</span>
                  </>
                ) : (
                  <>
                    <FolderOpen className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-zinc-500">Inbox</span>
                  </>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="start" side="left">
              <button
                onClick={() => { setProjectId(null); setProjectPickerOpen(false); }}
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
                  onClick={() => { setProjectId(project.id); setProjectPickerOpen(false); }}
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

          {/* Labels */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-[#2d2d2d] transition-colors text-left">
                <Tag className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-zinc-500">
                  {labelIds.length > 0 ? `${labelIds.length} label${labelIds.length > 1 ? 's' : ''}` : "Add label"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="start" side="left">
              {labels.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No labels
                </p>
              ) : (
                labels.map((label) => (
                  <button
                    key={label.id}
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
          <div className="flex flex-wrap gap-1 px-3 pb-3">
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
      </PopoverContent>
    </Popover>
  );
}
