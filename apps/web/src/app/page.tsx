"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/button";

export default function InboxPage() {
  const [showAddTask, setShowAddTask] = useState(false);

  return (
    <div className="h-full">
      <Header title="Inbox" />
      <div className="p-6 max-w-3xl mx-auto">
        <TaskList filters={{ projectId: "inbox" }} />

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
