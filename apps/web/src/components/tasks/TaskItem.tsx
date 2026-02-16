"use client";

import { useState } from "react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Flag, MoreHorizontal, Trash2, Calendar as CalendarIcon, Plus, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import { useTaskStore } from "@/stores/taskStore";
import { RichTextContent } from "@/components/ui/rich-text-editor";
import { TaskEditPopover } from "./TaskEditPopover";
import type { TaskWithLabels, Priority, SubtaskWithLabels } from "@proj-mgmt/shared";

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
  hideProject?: boolean;
  hideDueDate?: boolean;
  isDragging?: boolean;
  disableDrag?: boolean;
  isSubtask?: boolean;
}

export function TaskItem({ task, hideProject, hideDueDate, isDragging: isDraggingProp, disableDrag, isSubtask }: TaskItemProps) {
  const { completeTask, deleteTask, setTask, updateTask, addSubtask } = useTaskStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskContent, setNewSubtaskContent] = useState("");

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingSortable,
  } = useSortable({ id: task.id, disabled: disableDrag });

  const isDragging = isDraggingProp || isDraggingSortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Only apply drag listeners if dragging is enabled
  const dragProps = disableDrag ? {} : { ...attributes, ...listeners };

  const handleComplete = async () => {
    await completeTask(task.id);
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
  };

  const handleUpdate = (updatedTask: TaskWithLabels) => {
    setTask(updatedTask);
  };

  const handleDateSelect = async (date: Date | undefined) => {
    await updateTask(task.id, {
      dueDate: date ? date.toISOString() : null
    });
    setIsCalendarOpen(false);
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskContent.trim()) return;
    await addSubtask(task.id, { content: newSubtaskContent.trim() });
    setNewSubtaskContent("");
    setIsAddingSubtask(false);
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubtask();
    } else if (e.key === "Escape") {
      setNewSubtaskContent("");
      setIsAddingSubtask(false);
    }
  };

  const dueDate = task.dueDate ? formatDueDate(new Date(task.dueDate)) : null;

  return (
    <div>
      <TaskEditPopover
        task={task}
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        onUpdate={handleUpdate}
        onComplete={handleComplete}
      >
        <div
          ref={setNodeRef}
          style={style}
          {...dragProps}
          className={cn(
            "group flex items-start gap-2 border-b py-1.5 px-2 hover:bg-muted/50 rounded-md transition-colors",
            isDragging && "opacity-0",
            !disableDrag && "cursor-grab active:cursor-grabbing",
            isSubtask && "ml-6 border-b-0"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Expand/collapse button for tasks with subtasks */}
          {!isSubtask && hasSubtasks && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="h-[18px] w-[18px] flex-shrink-0 flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {/* Spacer for alignment when no subtasks */}
          {!isSubtask && !hasSubtasks && (
            <div className="h-[18px] w-[18px] flex-shrink-0" />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleComplete();
            }}
            className={cn(
              "h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 transition-colors hover:bg-muted",
              priorityColors[task.priority]
            )}
          />

          <div className="flex-1 min-w-0">
            <p className="text-sm leading-[18px]">{task.content}</p>
            {task.description && (
              <div className="mt-1 max-h-[2.5rem] overflow-hidden">
                <RichTextContent content={task.description} className="rich-text-content" />
              </div>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {!hideDueDate && dueDate && (
                <span className={cn("flex items-center gap-1 text-xs", dueDate.className)}>
                  <CalendarIcon className="h-3 w-3" />
                  {dueDate.text}
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

          {/* Project name on the right */}
          {!hideProject && task.project && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {task.project.name}
            </span>
          )}

          <div
            className={cn("flex items-center gap-1", !isHovered && !isCalendarOpen && "opacity-0")}
            onClick={(e) => e.stopPropagation()}
          >
            {task.priority !== "P4" && (
              <Flag
                className={cn("h-4 w-4", priorityColors[task.priority])}
                fill="currentColor"
              />
            )}
            {/* Add subtask button - only for parent tasks */}
            {!isSubtask && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingSubtask(true);
                  setIsExpanded(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1e1e1e] border-[#3d3d3d]" align="end">
                <DatePicker
                  date={task.dueDate ? new Date(task.dueDate) : undefined}
                  onSelect={handleDateSelect}
                  onClose={() => setIsCalendarOpen(false)}
                />
              </PopoverContent>
            </Popover>
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
      </TaskEditPopover>

      {/* Subtasks */}
      {!isSubtask && isExpanded && (
        <div className="ml-6">
          {task.subtasks?.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              parentId={task.id}
            />
          ))}
          {/* Add subtask input */}
          {isAddingSubtask && (
            <div className="flex items-center gap-2 py-1.5 px-2 ml-6">
              <div className="h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-gray-400" />
              <Input
                autoFocus
                placeholder="Add subtask..."
                value={newSubtaskContent}
                onChange={(e) => setNewSubtaskContent(e.target.value)}
                onKeyDown={handleSubtaskKeyDown}
                onBlur={() => {
                  if (!newSubtaskContent.trim()) {
                    setIsAddingSubtask(false);
                  }
                }}
                className="h-7 text-sm border-none bg-transparent focus-visible:ring-0 px-0"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Subtask item component
function SubtaskItem({ subtask, parentId }: { subtask: SubtaskWithLabels; parentId: string }) {
  const { completeTask, deleteTask, removeSubtaskFromParent } = useTaskStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleComplete = async () => {
    removeSubtaskFromParent(parentId, subtask.id);
    await completeTask(subtask.id);
  };

  const handleDelete = async () => {
    removeSubtaskFromParent(parentId, subtask.id);
    await deleteTask(subtask.id);
  };

  return (
    <div
      className="group flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded-md transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={handleComplete}
        className={cn(
          "h-[14px] w-[14px] flex-shrink-0 rounded-full border-2 transition-colors hover:bg-muted",
          priorityColors[subtask.priority]
        )}
      />
      <span className="flex-1 text-sm text-muted-foreground">{subtask.content}</span>
      <div className={cn("flex items-center gap-1", !isHovered && "opacity-0")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-3 w-3" />
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

// Overlay shown while dragging
export function TaskItemOverlay({ task, hideProject }: { task: TaskWithLabels; hideProject?: boolean }) {
  const dueDate = task.dueDate ? formatDueDate(new Date(task.dueDate)) : null;

  return (
    <div className="flex items-start gap-2 border-b py-1.5 px-2 bg-[#2d2d2d] rounded-md shadow-2xl border border-[#3d3d3d]">
      <div
        className={cn(
          "h-[18px] w-[18px] flex-shrink-0 rounded-full border-2",
          priorityColors[task.priority]
        )}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-[18px]">{task.content}</p>
        {task.description && (
          <div className="mt-1 max-h-[2.5rem] overflow-hidden">
            <RichTextContent content={task.description} className="rich-text-content" />
          </div>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {dueDate && (
            <span className={cn("flex items-center gap-1 text-xs", dueDate.className)}>
              <CalendarIcon className="h-3 w-3" />
              {dueDate.text}
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

      {/* Project name on the right */}
      {!hideProject && task.project && (
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {task.project.name}
        </span>
      )}
    </div>
  );
}
