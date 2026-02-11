"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Flag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";
import type { Priority } from "@proj-mgmt/shared";

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "P1", label: "Priority 1", color: "text-red-500" },
  { value: "P2", label: "Priority 2", color: "text-orange-500" },
  { value: "P3", label: "Priority 3", color: "text-blue-500" },
  { value: "P4", label: "Priority 4", color: "text-gray-400" },
];

interface TaskFormProps {
  projectId?: string;
  onClose?: () => void;
}

export function TaskForm({ projectId, onClose }: TaskFormProps) {
  const { addTask, fetchTasks } = useTaskStore();
  const { setAddTaskOpen } = useUIStore();
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Priority>("P4");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await addTask({
        content: content.trim(),
        priority,
        dueDate: dueDate?.toISOString(),
        projectId,
      });
      setContent("");
      setPriority("P4");
      setDueDate(undefined);
      fetchTasks();
      if (onClose) {
        onClose();
      } else {
        setAddTaskOpen(false);
      }
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

  const selectedPriority = priorities.find((p) => p.value === priority)!;

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
      <Input
        placeholder="Task name"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoFocus
        className="border-0 p-0 text-base focus-visible:ring-0 placeholder:text-muted-foreground"
      />

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-2",
                dueDate && "text-green-600 border-green-600"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              {dueDate ? format(dueDate, "MMM d") : "Due date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
            {dueDate && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setDueDate(undefined)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <Flag className={cn("h-4 w-4", selectedPriority.color)} />
              {selectedPriority.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {priorities.map((p) => (
              <DropdownMenuItem
                key={p.value}
                onClick={() => setPriority(p.value)}
              >
                <Flag className={cn("mr-2 h-4 w-4", p.color)} />
                {p.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!content.trim() || isSubmitting}>
          {isSubmitting ? "Adding..." : "Add task"}
        </Button>
      </div>
    </form>
  );
}
