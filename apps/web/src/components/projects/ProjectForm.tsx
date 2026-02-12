"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/stores/projectStore";

interface ProjectFormProps {
  onClose: () => void;
  defaultAreaId?: string;
}

export function ProjectForm({ onClose, defaultAreaId }: ProjectFormProps) {
  const { addProject } = useProjectStore();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await addProject({
        name: name.trim(),
        areaId: defaultAreaId,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Name</label>
        <Input
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || isSubmitting}>
          {isSubmitting ? "Adding..." : "Add project"}
        </Button>
      </div>
    </form>
  );
}
