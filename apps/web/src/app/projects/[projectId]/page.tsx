"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { ProjectWithTasks } from "@proj-mgmt/shared";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<ProjectWithTasks | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await api.projects.get(projectId);
        setProject(data);
      } catch (error) {
        console.error("Failed to load project:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [projectId]);

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

  if (!project) {
    return (
      <div className="h-full">
        <Header title="Project not found" />
        <div className="p-6 max-w-3xl mx-auto">
          <p className="text-muted-foreground">
            This project does not exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Header title={project.name} />
      <div className="p-6 max-w-3xl mx-auto">
        <TaskList filters={{ projectId }} />

        {showAddTask ? (
          <div className="mt-4">
            <TaskForm
              projectId={projectId}
              onClose={() => setShowAddTask(false)}
            />
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
