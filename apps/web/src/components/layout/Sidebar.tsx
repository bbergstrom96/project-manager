"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Inbox,
  Calendar,
  CalendarDays,
  Hash,
  Plus,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  GanttChart,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectStore } from "@/stores/projectStore";
import { useLabelStore } from "@/stores/labelStore";
import { useAreaStore } from "@/stores/areaStore";
import { useUIStore } from "@/stores/uiStore";
import { AddProjectDialog } from "@/components/projects/AddProjectDialog";
import { EditProjectDialog } from "@/components/projects/EditProjectDialog";
import { AddAreaDialog } from "@/components/planning/AddAreaDialog";
import { EditAreaDialog } from "@/components/planning/EditAreaDialog";
import { EditLabelDialog } from "@/components/labels/EditLabelDialog";
import { api } from "@/lib/api";
import type { Area, Project, Label } from "@proj-mgmt/shared";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  color?: string;
}

function NavItem({ href, icon, label, count, color }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <span style={{ color }}>{icon}</span>
      <span className="flex-1">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-muted-foreground">{count}</span>
      )}
    </Link>
  );
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
}

function CollapsibleSection({ title, children, onAdd }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-between px-3 py-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {title}
        </button>
        {onAdd && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isOpen && <div className="space-y-1">{children}</div>}
    </div>
  );
}

interface ProjectNavItemProps {
  project: any;
  areaColor?: string;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  isDragging?: boolean;
}

function ProjectNavItem({ project, areaColor, onEdit, onDelete, isDragging: isDraggingProp }: ProjectNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/projects/${project.id}`;
  const iconColor = areaColor || project.color;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingSortable,
  } = useSortable({ id: project.id });

  const isDragging = isDraggingProp || isDraggingSortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group/project flex items-center cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <Link
        href={`/projects/${project.id}`}
        onClick={(e) => {
          // Prevent navigation when dragging
          if (isDragging) {
            e.preventDefault();
          }
        }}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors flex-1",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <FolderKanban className="h-4 w-4 flex-shrink-0" style={{ color: iconColor }} />
        <span className="flex-1 truncate">{project.name}</span>
        {project._count?.tasks > 0 && (
          <span className="text-xs text-muted-foreground">{project._count.tasks}</span>
        )}
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover/project:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(project as Project)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(project.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Overlay shown while dragging a project
function ProjectNavItemOverlay({ project, areaColor }: { project: any; areaColor?: string }) {
  const iconColor = areaColor || project.color;

  return (
    <div className="flex items-center bg-[#2d2d2d] rounded-md shadow-lg border border-[#3d3d3d] px-3 py-1.5">
      <FolderKanban className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: iconColor }} />
      <span className="text-sm">{project.name}</span>
    </div>
  );
}

interface LabelNavItemProps {
  label: any;
  onEdit: (label: Label) => void;
  onDelete: (labelId: string) => void;
}

function LabelNavItem({ label, onEdit, onDelete }: LabelNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/labels/${label.id}`;

  return (
    <div className="group/label flex items-center">
      <Link
        href={`/labels/${label.id}`}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors flex-1",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Hash className="h-4 w-4" style={{ color: label.color }} />
        <span className="flex-1">{label.name}</span>
        {label._count?.tasks > 0 && (
          <span className="text-xs text-muted-foreground">{label._count.tasks}</span>
        )}
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover/label:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(label as Label)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(label.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface AreaSectionProps {
  area: { id: string; name: string; icon: string | null; color: string; projects: any[] };
  onAddProject: (areaId: string) => void;
  onEditArea: (area: Area) => void;
  onDeleteArea: (areaId: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  activeProjectId?: string | null;
}

function AreaSection({ area, onAddProject, onEditArea, onDeleteArea, onEditProject, onDeleteProject, activeProjectId }: AreaSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const { setNodeRef, isOver } = useDroppable({
    id: `area-${area.id}`,
    data: { type: "area", areaId: area.id },
  });

  return (
    <div className="group/area">
      <div className="flex items-center justify-between px-3 py-2">
        <Link
          href={`/areas/${area.id}`}
          className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 flex-1"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {area.icon && <span>{area.icon}</span>}
          <span className="uppercase tracking-wide" style={{ color: area.color }}>{area.name}</span>
        </Link>
        <div className="flex items-center gap-1 opacity-0 group-hover/area:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onAddProject(area.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditArea(area as unknown as Area)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteArea(area.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {isOpen && (
        <div
          ref={setNodeRef}
          className={cn(
            "ml-4 space-y-0.5 min-h-[8px] rounded transition-colors",
            isOver && "bg-accent/50"
          )}
        >
          <SortableContext
            items={area.projects.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {area.projects.map((project: any) => (
              <ProjectNavItem
                key={project.id}
                project={project}
                areaColor={area.color}
                onEdit={onEditProject}
                onDelete={onDeleteProject}
                isDragging={activeProjectId === project.id}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, setAddTaskOpen } = useUIStore();
  const { fetchProjects, deleteProject, updateProject } = useProjectStore();
  const { areas, fetchAreas, deleteArea, reorderProjectsInArea } = useAreaStore();
  const { labels, fetchLabels, deleteLabel } = useLabelStore();
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [addProjectAreaId, setAddProjectAreaId] = useState<string | undefined>();
  const [addAreaOpen, setAddAreaOpen] = useState(false);
  const [editAreaOpen, setEditAreaOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editLabelOpen, setEditLabelOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [activeProject, setActiveProject] = useState<{ project: any; areaColor: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchProjects();
    fetchAreas();
    fetchLabels();
  }, [fetchProjects, fetchAreas, fetchLabels]);

  const handleAddProject = (areaId: string) => {
    setAddProjectAreaId(areaId);
    setAddProjectOpen(true);
  };

  const handleProjectDialogClose = (open: boolean) => {
    setAddProjectOpen(open);
    if (!open) {
      // Refresh areas to show the new project under its area
      fetchAreas();
    }
  };

  const handleEditArea = (area: Area) => {
    setEditingArea(area);
    setEditAreaOpen(true);
  };

  const handleDeleteArea = async (areaId: string) => {
    if (confirm("Are you sure you want to delete this area? Projects in this area will become unassigned.")) {
      await deleteArea(areaId);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditProjectOpen(true);
  };

  const handleEditProjectClose = (open: boolean) => {
    setEditProjectOpen(open);
    if (!open) {
      fetchAreas(); // Refresh to show updated project
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project? All tasks in this project will be deleted.")) {
      await deleteProject(projectId);
      fetchAreas(); // Refresh areas list
    }
  };

  const handleEditLabel = (label: Label) => {
    setEditingLabel(label);
    setEditLabelOpen(true);
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (confirm("Are you sure you want to delete this label?")) {
      await deleteLabel(labelId);
    }
  };

  // Find which area a project belongs to
  const findProjectArea = (projectId: string) => {
    for (const area of areas) {
      const project = area.projects.find((p) => p.id === projectId);
      if (project) {
        return { area, project };
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const result = findProjectArea(event.active.id as string);
    if (result) {
      setActiveProject({ project: result.project, areaColor: result.area.color });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the source area and project
    const sourceResult = findProjectArea(activeId);
    if (!sourceResult) return;

    const { area: sourceArea, project: draggedProject } = sourceResult;

    // Check if dropped on an area (for moving between areas)
    if (overId.startsWith("area-")) {
      const targetAreaId = overId.replace("area-", "");

      // If dropped on a different area
      if (targetAreaId !== sourceArea.id) {
        // Remove from source area
        const updatedSourceProjects = sourceArea.projects.filter((p) => p.id !== activeId);
        reorderProjectsInArea(sourceArea.id, updatedSourceProjects);

        // Add to target area
        const targetArea = areas.find((a) => a.id === targetAreaId);
        if (targetArea) {
          const updatedTargetProjects = [...targetArea.projects, draggedProject];
          reorderProjectsInArea(targetAreaId, updatedTargetProjects);

          // Update project's areaId in backend
          try {
            await updateProject(activeId, { areaId: targetAreaId });
            await api.projects.reorder(updatedTargetProjects.map((p) => p.id));
          } catch (error) {
            console.error("Failed to move project:", error);
            fetchAreas();
          }
        }
        return;
      }
    }

    // Check if dropped on another project (for reordering)
    const targetResult = findProjectArea(overId);
    if (targetResult) {
      const { area: targetArea } = targetResult;

      if (sourceArea.id === targetArea.id) {
        // Reordering within the same area
        if (activeId !== overId) {
          const oldIndex = sourceArea.projects.findIndex((p) => p.id === activeId);
          const newIndex = sourceArea.projects.findIndex((p) => p.id === overId);

          if (oldIndex !== -1 && newIndex !== -1) {
            const reorderedProjects = arrayMove(sourceArea.projects, oldIndex, newIndex);
            reorderProjectsInArea(sourceArea.id, reorderedProjects);

            try {
              await api.projects.reorder(reorderedProjects.map((p) => p.id));
            } catch (error) {
              console.error("Failed to reorder projects:", error);
              fetchAreas();
            }
          }
        }
      } else {
        // Moving to a different area (dropped on a project in that area)
        // Remove from source area
        const updatedSourceProjects = sourceArea.projects.filter((p) => p.id !== activeId);
        reorderProjectsInArea(sourceArea.id, updatedSourceProjects);

        // Add to target area at the position of the target project
        const targetIndex = targetArea.projects.findIndex((p) => p.id === overId);
        const updatedTargetProjects = [...targetArea.projects];
        updatedTargetProjects.splice(targetIndex, 0, draggedProject);
        reorderProjectsInArea(targetArea.id, updatedTargetProjects);

        // Update project's areaId in backend
        try {
          await updateProject(activeId, { areaId: targetArea.id });
          await api.projects.reorder(updatedTargetProjects.map((p) => p.id));
        } catch (error) {
          console.error("Failed to move project:", error);
          fetchAreas();
        }
      }
    }
  };

  const handleDragCancel = () => {
    setActiveProject(null);
  };

  if (!sidebarOpen) return null;

  return (
    <>
    <AddAreaDialog open={addAreaOpen} onOpenChange={setAddAreaOpen} />
    <EditAreaDialog
      area={editingArea}
      open={editAreaOpen}
      onOpenChange={setEditAreaOpen}
    />
    <AddProjectDialog
      open={addProjectOpen}
      onOpenChange={handleProjectDialogClose}
      defaultAreaId={addProjectAreaId}
    />
    <EditProjectDialog
      project={editingProject}
      open={editProjectOpen}
      onOpenChange={handleEditProjectClose}
    />
    <EditLabelDialog
      label={editingLabel}
      open={editLabelOpen}
      onOpenChange={setEditLabelOpen}
    />
    <aside className="flex h-full w-64 flex-col border-r" style={{ backgroundColor: '#252830' }}>
      <div className="p-4">
        <Button
          className="w-full justify-start gap-2"
          onClick={() => setAddTaskOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2">
        <NavItem href="/" icon={<Inbox className="h-4 w-4" />} label="Inbox" />
        <NavItem
          href="/today"
          icon={<Calendar className="h-4 w-4" />}
          label="Today"
        />
        <NavItem
          href="/upcoming"
          icon={<CalendarDays className="h-4 w-4" />}
          label="This Week"
        />
        <NavItem
          href="/planning"
          icon={<GanttChart className="h-4 w-4" />}
          label="Planning"
        />

        <Separator className="my-4" />

        {/* Areas header with add button */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Areas
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setAddAreaOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Areas with nested projects */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {areas.map((area) => (
            <AreaSection
              key={area.id}
              area={area}
              onAddProject={handleAddProject}
              onEditArea={handleEditArea}
              onDeleteArea={handleDeleteArea}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              activeProjectId={activeProject?.project.id}
            />
          ))}
          <DragOverlay>
            {activeProject ? (
              <ProjectNavItemOverlay
                project={activeProject.project}
                areaColor={activeProject.areaColor}
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        {areas.length === 0 && (
          <p className="px-3 py-2 text-xs text-muted-foreground">
            No areas yet. Click + to create one.
          </p>
        )}

        <Separator className="my-4" />

        <CollapsibleSection title="Labels">
          {labels.map((label) => (
            <LabelNavItem
              key={label.id}
              label={label}
              onEdit={handleEditLabel}
              onDelete={handleDeleteLabel}
            />
          ))}
        </CollapsibleSection>
      </nav>
    </aside>
    </>
  );
}
