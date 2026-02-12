"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, ListTodo, StickyNote } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ProjectDescription } from "@/components/projects/ProjectDescription";
import { ProjectSections } from "@/components/sections/ProjectSections";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProjectStore } from "@/stores/projectStore";
import { useTaskStore } from "@/stores/taskStore";
import { api } from "@/lib/api";
import type { ProjectWithTasks } from "@proj-mgmt/shared";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { deleteProject } = useProjectStore();
  const { tasks, setFilters } = useTaskStore();
  const [project, setProject] = useState<ProjectWithTasks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"tasks" | "notes">("tasks");

  useEffect(() => {
    async function loadProject() {
      try {
        const projectData = await api.projects.get(projectId);
        setProject(projectData);
      } catch (error) {
        console.error("Failed to load project:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [projectId]);

  useEffect(() => {
    setFilters({ projectId });
  }, [projectId, setFilters]);

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

  const handleDescriptionUpdate = (description: string | null) => {
    setProject({ ...project, description });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      router.push("/");
    } catch (error) {
      console.error("Failed to delete project:", error);
      setIsDeleting(false);
    }
  };

  const headerActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{project.name}&quot;? This will also delete all tasks in this project. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    <div className="h-full flex flex-col">
      <Header title={project.name} actions={headerActions} />

      {/* Mobile tabs - only visible on small screens */}
      <div className="lg:hidden border-b px-4">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "tasks"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <ListTodo className="h-4 w-4" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "notes"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <StickyNote className="h-4 w-4" />
            Notes
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        {/* Desktop: side by side layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 p-6 h-full">
          {/* Tasks column */}
          <div className="overflow-auto">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Tasks
            </h2>
            <ProjectSections
              projectId={projectId}
              tasks={tasks}
            />
          </div>

          {/* Notes column */}
          <div className="overflow-auto">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Notes
            </h2>
            <ProjectDescription
              projectId={projectId}
              description={project.description}
              onUpdate={handleDescriptionUpdate}
            />
          </div>
        </div>

        {/* Mobile: tabbed content */}
        <div className="lg:hidden p-4">
          {activeTab === "tasks" ? (
            <ProjectSections
              projectId={projectId}
              tasks={tasks}
            />
          ) : (
            <ProjectDescription
              projectId={projectId}
              description={project.description}
              onUpdate={handleDescriptionUpdate}
            />
          )}
        </div>
      </div>
    </div>
    </>
  );
}
