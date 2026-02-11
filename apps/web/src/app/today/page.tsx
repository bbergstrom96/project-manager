"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/button";

export default function TodayPage() {
  const [showAddTask, setShowAddTask] = useState(false);
  const today = new Date();

  return (
    <div className="h-full">
      <Header title="Today" />
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-sm text-muted-foreground mb-4">
          {format(today, "EEEE, MMMM d")}
        </p>

        <TaskList filters={{ dueDate: "today" }} />

        {showAddTask ? (
          <div className="mt-4">
            <TaskForm onClose={() => setShowAddTask(false)} />
          </div>
        ) : (
          <Button
            variant="ghost"
            className="mt-4 w-full justify-start text-muted-foreground"
            onClick={() => setShowAddTask(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add task
          </Button>
        )}
      </div>
    </div>
  );
}
