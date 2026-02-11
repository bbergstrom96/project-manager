"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUIStore } from "@/stores/uiStore";
import { TaskForm } from "./TaskForm";

export function AddTaskDialog() {
  const { addTaskOpen, setAddTaskOpen } = useUIStore();

  return (
    <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>
        <TaskForm onClose={() => setAddTaskOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
