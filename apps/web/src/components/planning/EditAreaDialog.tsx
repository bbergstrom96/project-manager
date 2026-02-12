"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAreaStore } from "@/stores/areaStore";
import { PROJECT_COLORS } from "@proj-mgmt/shared";
import type { Area } from "@proj-mgmt/shared";

interface EditAreaDialogProps {
  area: Area | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAreaDialog({ area, open, onOpenChange }: EditAreaDialogProps) {
  const { updateArea } = useAreaStore();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0].hex);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (area && open) {
      setName(area.name);
      setIcon(area.icon || "");
      setColor(area.color);
    }
  }, [area, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!area || !name.trim()) return;

    setIsSubmitting(true);
    try {
      await updateArea(area.id, {
        name: name.trim(),
        icon: icon || null,
        color,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Area</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Personal, Professional, Health"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon (emoji)</Label>
            <Input
              id="icon"
              placeholder="e.g., 🎯, 💼, 🏃"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    color === c.hex ? "border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
