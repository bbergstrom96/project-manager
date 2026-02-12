"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, FolderKanban, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/stores/projectStore";
import { useLabelStore } from "@/stores/labelStore";
import { api } from "@/lib/api";
import type { Area, Project, TaskWithLabels } from "@proj-mgmt/shared";

interface AreaWithDetails extends Area {
  projects: Project[];
  tasks: TaskWithLabels[];
}

export default function AreaPage() {
  const params = useParams();
  const areaId = params.areaId as string;
  const [area, setArea] = useState<AreaWithDetails | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formKey = useRef(0);

  // Pre-fetch data so TaskForm doesn't cause jitter when opened
  const { projects, fetchProjects } = useProjectStore();
  const { labels, fetchLabels } = useLabelStore();

  useEffect(() => {
    if (projects.length === 0) fetchProjects();
    if (labels.length === 0) fetchLabels();
  }, [projects.length, labels.length, fetchProjects, fetchLabels]);

  useEffect(() => {
    async function loadArea() {
      try {
        const data = await api.areas.get(areaId) as unknown as AreaWithDetails;
        setArea(data);
      } catch (error) {
        console.error("Failed to load area:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadArea();
  }, [areaId]);

  const handleOpenForm = () => {
    formKey.current += 1;
    setHasOpened(true);
    setShowAddTask(true);
  };

  const handleCloseForm = () => {
    setShowAddTask(false);
  };

  if (isLoading) {
    return (
      <div className="h-full">
        <Header title="Loading..." />
        <div className="p-6 max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="h-full">
        <Header title="Area not found" />
        <div className="p-6 max-w-3xl mx-auto">
          <p className="text-muted-foreground">
            This area does not exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  const headerTitle = (
    <span className="flex items-center gap-2">
      {area.icon && <span>{area.icon}</span>}
      <span className="uppercase tracking-wide" style={{ color: area.color }}>{area.name}</span>
    </span>
  );

  return (
    <div className="h-full">
      <Header title={headerTitle} />
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Projects in this area */}
        {area.projects.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Projects</h3>
            <div className="grid grid-cols-2 gap-3">
              {area.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <FolderKanban
                    className="h-5 w-5"
                    style={{ color: area.color }}
                  />
                  <span className="font-medium">{project.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Direct tasks in this area (not in a project) */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Tasks</h3>
          <TaskList filters={{ areaId }} hideProject />

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
                  areaId={areaId}
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
    </div>
  );
}
