"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/stores/projectStore";
import { useLabelStore } from "@/stores/labelStore";

export default function TodayPage() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const today = new Date();
  const formKey = useRef(0);

  // Pre-fetch data so TaskForm doesn't cause jitter when opened
  const { projects, fetchProjects } = useProjectStore();
  const { labels, fetchLabels } = useLabelStore();

  useEffect(() => {
    if (projects.length === 0) fetchProjects();
    if (labels.length === 0) fetchLabels();
  }, [projects.length, labels.length, fetchProjects, fetchLabels]);

  const handleOpenForm = () => {
    formKey.current += 1;
    setHasOpened(true);
    setShowAddTask(true);
  };

  const handleCloseForm = () => {
    setShowAddTask(false);
  };

  return (
    <div className="h-full">
      <Header title="Today" />
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-sm text-muted-foreground mb-4">
          {format(today, "EEEE, MMMM d")}
        </p>

        <TaskList filters={{ dueDate: "today" }} hideDueDate />

        <div className="mt-4">
          {/* Form - only mount after first open, then keep mounted for smooth transitions */}
          {hasOpened && (
            <div
              className={cn(
                "transition-all duration-200 ease-out overflow-hidden",
                showAddTask
                  ? "opacity-100 max-h-[500px]"
                  : "opacity-0 max-h-0 pointer-events-none"
              )}
            >
              <TaskForm
                key={formKey.current}
                defaultDueDate={today.toISOString()}
                onClose={handleCloseForm}
              />
            </div>
          )}

          {/* Add task button */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-muted-foreground transition-all duration-200",
              showAddTask && "opacity-0 h-0 overflow-hidden pointer-events-none"
            )}
            onClick={handleOpenForm}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add task
          </Button>
        </div>
      </div>
    </div>
  );
}
