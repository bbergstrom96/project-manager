"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectForm } from "./ProjectForm";

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAreaId?: string;
}

export function AddProjectDialog({ open, onOpenChange, defaultAreaId }: AddProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
        </DialogHeader>
        <ProjectForm onClose={() => onOpenChange(false)} defaultAreaId={defaultAreaId} />
      </DialogContent>
    </Dialog>
  );
}
