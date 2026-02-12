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
import { Label as FormLabel } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLabelStore } from "@/stores/labelStore";
import { PROJECT_COLORS } from "@proj-mgmt/shared";
import type { Label } from "@proj-mgmt/shared";

interface EditLabelDialogProps {
  label: Label | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLabelDialog({ label, open, onOpenChange }: EditLabelDialogProps) {
  const { updateLabel } = useLabelStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(PROJECT_COLORS[0].hex);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (label && open) {
      setName(label.name);
      setColor(label.color);
    }
  }, [label, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !name.trim()) return;

    setIsSubmitting(true);
    try {
      await updateLabel(label.id, {
        name: name.trim(),
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
          <DialogTitle>Edit Label</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input
              id="name"
              placeholder="Label name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <FormLabel>Color</FormLabel>
            <div className="grid grid-cols-9 gap-1">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={cn(
                    "h-6 w-6 rounded-full transition-transform hover:scale-110",
                    color === c.hex && "ring-2 ring-offset-2 ring-primary"
                  )}
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
