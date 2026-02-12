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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectStore } from "@/stores/projectStore";
import { generateWeeksForYear, getMonthName } from "@/lib/weeks";
import { PROJECT_COLORS } from "@proj-mgmt/shared";
import type { Project } from "@proj-mgmt/shared";

interface ProjectPlanningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areaId: string | null;
  project: Project | null;
  defaultPeriod: string | null;
  viewMode: "month" | "quarter";
  year: number;
}

export function ProjectPlanningDialog({
  open,
  onOpenChange,
  areaId,
  project,
  defaultPeriod,
  viewMode,
  year,
}: ProjectPlanningDialogProps) {
  const { projects, addProject, updateProject, fetchProjects } = useProjectStore();
  const [mode, setMode] = useState<"select" | "create">("select");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(PROJECT_COLORS[0].hex);
  const [startWeek, setStartWeek] = useState("");
  const [endWeek, setEndWeek] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weeks = generateWeeksForYear(year);

  // Filter projects that don't have an area assigned yet (available for assignment)
  const availableProjects = projects.filter(
    (p) => !p.isArchived && (!p.areaId || p.id === project?.id)
  );

  useEffect(() => {
    if (open) {
      if (project) {
        // Editing existing project
        setMode("select");
        setSelectedProjectId(project.id);
        setName(project.name);
        setColor(project.color);
        setStartWeek(project.startWeek || "");
        setEndWeek(project.endWeek || "");
      } else {
        // New assignment
        setMode("select");
        setSelectedProjectId("");
        setName("");
        setColor(PROJECT_COLORS[0].hex);

        // Set default period based on clicked cell
        if (defaultPeriod) {
          if (viewMode === "month") {
            setStartWeek(defaultPeriod);
            setEndWeek(defaultPeriod);
          } else {
            // Quarter view - defaultPeriod is month number
            const monthNum = parseInt(defaultPeriod);
            const monthWeeks = weeks.filter((w) => w.month === monthNum);
            if (monthWeeks.length > 0) {
              setStartWeek(monthWeeks[0].week);
              setEndWeek(monthWeeks[monthWeeks.length - 1].week);
            }
          }
        } else {
          setStartWeek("");
          setEndWeek("");
        }
      }
    }
  }, [open, project, defaultPeriod, viewMode, weeks]);

  const handleSubmit = async () => {
    if (!areaId) return;

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        // Create new project
        if (!name.trim()) return;
        await addProject({
          name: name.trim(),
          color,
          areaId,
          startWeek: startWeek || undefined,
          endWeek: endWeek || undefined,
        });
      } else if (selectedProjectId) {
        // Assign existing project to area
        await updateProject(selectedProjectId, {
          areaId,
          startWeek: startWeek || null,
          endWeek: endWeek || null,
        });
      }
      await fetchProjects();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFromPlanning = async () => {
    if (!project) return;

    setIsSubmitting(true);
    try {
      await updateProject(project.id, {
        areaId: null,
        startWeek: null,
        endWeek: null,
      });
      await fetchProjects();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {project ? "Edit Project Planning" : "Add Project to Planning"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!project && (
            <div className="flex gap-2">
              <Button
                variant={mode === "select" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("select")}
              >
                Existing Project
              </Button>
              <Button
                variant={mode === "create" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("create")}
              >
                New Project
              </Button>
            </div>
          )}

          {mode === "select" && !project && (
            <div className="space-y-2">
              <Label>Select Project</Label>
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      No unassigned projects available.
                      <br />
                      Create a new project instead.
                    </div>
                  ) : (
                    availableProjects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          {p.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "create" && (
            <>
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter project name..."
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
                        color === c.hex
                          ? "border-foreground"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Week</Label>
              <Select value={startWeek} onValueChange={setStartWeek}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map((w) => (
                    <SelectItem key={w.week} value={w.week}>
                      {w.week} ({getMonthName(w.month).slice(0, 3)} W{w.weekInMonth})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>End Week</Label>
              <Select value={endWeek} onValueChange={setEndWeek}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map((w) => (
                    <SelectItem key={w.week} value={w.week}>
                      {w.week} ({getMonthName(w.month).slice(0, 3)} W{w.weekInMonth})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {project && (
                <Button
                  variant="destructive"
                  onClick={handleRemoveFromPlanning}
                  disabled={isSubmitting}
                >
                  Remove from Planning
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (mode === "select" && !selectedProjectId && !project) ||
                  (mode === "create" && !name.trim())
                }
              >
                {isSubmitting ? "Saving..." : project ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
