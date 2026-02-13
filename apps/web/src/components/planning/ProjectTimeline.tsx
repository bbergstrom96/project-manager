"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon, ExternalLink, CalendarOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/stores/projectStore";
import { generateWeeksForYear, getCurrentWeek, getShortMonthName } from "@/lib/weeks";
import type { Area, Project } from "@proj-mgmt/shared";

interface AreaWithProjects extends Area {
  projects: Project[];
}

interface ProjectTimelineProps {
  areas: AreaWithProjects[];
}

const WEEK_WIDTH = 80;
const ROW_HEIGHT = 36;
const AREA_GAP = 16; // Spacing between areas

type DragType = "move" | "resize-start" | "resize-end";

interface DragState {
  projectId: string;
  project: Project;
  type: DragType;
  initialX: number;
  initialStartWeek: string;
  initialEndWeek: string;
}

export function ProjectTimeline({ areas }: ProjectTimelineProps) {
  const router = useRouter();
  const { projects, fetchProjects, updateProject, deleteProject } = useProjectStore();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [tempWeeks, setTempWeeks] = useState<{ startWeek: string; endWeek: string } | null>(null);
  const [collapsedAreas, setCollapsedAreas] = useState<Set<string>>(new Set());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const justDraggedRef = useRef(false);

  const allWeeks = generateWeeksForYear(currentYear);
  const { week: currentWeek } = getCurrentWeek();
  const thisYear = new Date().getFullYear();

  // For current year: start from current week. For past/future years: show all weeks
  const weeks = currentYear === thisYear
    ? allWeeks.slice(allWeeks.findIndex(w => w.week === currentWeek))
    : allWeeks;

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Reset scroll position when year changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [currentYear]);

  // Convert week string to index
  const weekToIndex = useCallback((week: string): number => {
    const index = weeks.findIndex(w => w.week === week);
    return index >= 0 ? index : 0;
  }, [weeks]);

  // Convert index to week string
  const indexToWeek = useCallback((index: number): string => {
    const clampedIndex = Math.max(0, Math.min(weeks.length - 1, index));
    return weeks[clampedIndex]?.week || "1.1";
  }, [weeks]);

  // Get week index from mouse X position relative to timeline
  const getWeekIndexFromX = useCallback((clientX: number): number => {
    if (!scrollContainerRef.current) return 0;
    const rect = scrollContainerRef.current.getBoundingClientRect();
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const x = clientX - rect.left + scrollLeft;
    return Math.max(0, Math.floor(x / WEEK_WIDTH));
  }, []);

  // Estimate the height of a project bar based on text length and width
  const getProjectBarHeight = (project: Project) => {
    const startIndex = weekToIndex(project.startWeek || currentWeek);
    const endIndex = weekToIndex(project.endWeek || currentWeek);
    const barWidth = (endIndex - startIndex + 1) * WEEK_WIDTH;
    const textWidth = barWidth - 32; // Account for padding and resize handles
    const charsPerLine = Math.max(1, Math.floor(textWidth / 6.5)); // ~6.5px per character for text-xs
    const numLines = Math.ceil(project.name.length / charsPerLine);
    const lineHeight = 20; // generous line height
    const padding = 16; // generous padding
    return Math.max(ROW_HEIGHT - 8, numLines * lineHeight + padding);
  };

  // Get project bar position and width
  const getProjectBarStyle = (project: Project) => {
    const startWeek = dragState?.projectId === project.id && tempWeeks
      ? tempWeeks.startWeek
      : project.startWeek;
    const endWeek = dragState?.projectId === project.id && tempWeeks
      ? tempWeeks.endWeek
      : project.endWeek;

    if (!startWeek || !endWeek) return null;

    const startIndex = weekToIndex(startWeek);
    const endIndex = weekToIndex(endWeek);
    const left = startIndex * WEEK_WIDTH;
    const width = (endIndex - startIndex + 1) * WEEK_WIDTH;

    return { left, width };
  };

  // Handle drag start for existing bars (move/resize)
  const handleBarDragStart = (
    e: React.MouseEvent,
    project: Project,
    type: DragType
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!project.startWeek || !project.endWeek) return;

    justDraggedRef.current = false;
    setDragState({
      projectId: project.id,
      project,
      type,
      initialX: e.clientX,
      initialStartWeek: project.startWeek,
      initialEndWeek: project.endWeek,
    });
    setTempWeeks({
      startWeek: project.startWeek,
      endWeek: project.endWeek,
    });
  };

  // Menu actions
  const handleOpenProject = (project: Project) => {
    router.push(`/projects/${project.id}`);
    setMenuOpen(false);
    setSelectedProject(null);
  };

  const handleUnscheduleProject = async (project: Project) => {
    // Close menu immediately before the project moves
    setMenuOpen(false);
    setSelectedProject(null);

    await updateProject(project.id, {
      startWeek: null,
      endWeek: null,
    });
  };

  const handleDeleteProject = async (project: Project) => {
    // Close menu immediately before the project is removed
    setMenuOpen(false);
    setSelectedProject(null);

    await deleteProject(project.id);
  };

  // Handle drag move (for scheduled projects only - move/resize)
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!dragState || !tempWeeks) return;

    const deltaX = e.clientX - dragState.initialX;

    // Mark as dragged if mouse moved more than 5px
    if (Math.abs(deltaX) > 5) {
      justDraggedRef.current = true;
    }

    const weekDelta = Math.round(deltaX / WEEK_WIDTH);

    const initialStartIndex = weekToIndex(dragState.initialStartWeek);
    const initialEndIndex = weekToIndex(dragState.initialEndWeek);

    let newStartIndex = initialStartIndex;
    let newEndIndex = initialEndIndex;

    if (dragState.type === "move") {
      newStartIndex = initialStartIndex + weekDelta;
      newEndIndex = initialEndIndex + weekDelta;
      if (newStartIndex < 0) {
        newEndIndex -= newStartIndex;
        newStartIndex = 0;
      }
      if (newEndIndex >= weeks.length) {
        newStartIndex -= (newEndIndex - weeks.length + 1);
        newEndIndex = weeks.length - 1;
      }
    } else if (dragState.type === "resize-start") {
      newStartIndex = Math.min(initialStartIndex + weekDelta, initialEndIndex);
      newStartIndex = Math.max(0, newStartIndex);
    } else if (dragState.type === "resize-end") {
      newEndIndex = Math.max(initialEndIndex + weekDelta, initialStartIndex);
      newEndIndex = Math.min(weeks.length - 1, newEndIndex);
    }

    setTempWeeks({
      startWeek: indexToWeek(newStartIndex),
      endWeek: indexToWeek(newEndIndex),
    });
  }, [dragState, tempWeeks, weekToIndex, indexToWeek, weeks.length]);

  // Handle drag end (save the new dates)
  const handleDragEnd = useCallback(async () => {
    if (dragState && tempWeeks && justDraggedRef.current) {
      await updateProject(dragState.projectId, {
        startWeek: tempWeeks.startWeek,
        endWeek: tempWeeks.endWeek,
      });
    }

    setDragState(null);
    setTempWeeks(null);

    // Clear justDragged flag after a short delay (so click event sees it)
    setTimeout(() => {
      justDraggedRef.current = false;
    }, 100);
  }, [dragState, tempWeeks, updateProject]);

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (dragState) {
      const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
      const handleMouseUp = () => handleDragEnd();

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState, handleDragMove, handleDragEnd]);

  // Get scheduled projects for an area
  const getScheduledByArea = (areaId: string) =>
    projects.filter(p => p.areaId === areaId && !p.isArchived && p.startWeek && p.endWeek);

  // Calculate Y positions for projects within an area (handles overlapping and variable heights)
  const getProjectLayoutInArea = (areaId: string) => {
    const areaProjects = getScheduledByArea(areaId);
    // Track rows with their Y end positions and week ranges
    const rows: { endY: number; start: number; end: number }[][] = [];
    const layoutMap = new Map<string, { top: number; height: number }>();

    areaProjects
      .sort((a, b) => weekToIndex(a.startWeek!) - weekToIndex(b.startWeek!))
      .forEach(project => {
        const start = weekToIndex(project.startWeek!);
        const end = weekToIndex(project.endWeek!);
        const height = getProjectBarHeight(project);

        // Find a row where this project doesn't overlap
        let rowIndex = 0;
        let topY = 4; // Initial padding

        while (true) {
          if (!rows[rowIndex]) rows[rowIndex] = [];
          const overlappingItem = rows[rowIndex].find(p => !(end < p.start || start > p.end));

          if (!overlappingItem) {
            // Calculate top based on max endY of previous rows
            if (rowIndex > 0) {
              topY = Math.max(...rows.slice(0, rowIndex).flat().map(r => r.endY)) + 4;
            }
            rows[rowIndex].push({ endY: topY + height, start, end });
            layoutMap.set(project.id, { top: topY, height });
            break;
          }
          rowIndex++;
        }
      });

    // Calculate total height needed (add padding at the bottom)
    const totalHeight = rows.length > 0
      ? Math.max(...rows.flat().map(r => r.endY)) + 8
      : ROW_HEIGHT;

    return {
      getLayout: (projectId: string) => layoutMap.get(projectId) || { top: 4, height: ROW_HEIGHT - 8 },
      totalHeight: Math.max(ROW_HEIGHT, totalHeight),
    };
  };

  // Toggle area collapse in timeline
  const toggleArea = (areaId: string) => {
    setCollapsedAreas(prev => {
      const next = new Set(prev);
      if (next.has(areaId)) {
        next.delete(areaId);
      } else {
        next.add(areaId);
      }
      return next;
    });
  };

  // Group months for header
  const monthGroups: { month: number; startIndex: number; count: number }[] = [];
  let currentMonthNum = -1;
  weeks.forEach((week, index) => {
    if (week.month !== currentMonthNum) {
      monthGroups.push({ month: week.month, startIndex: index, count: 1 });
      currentMonthNum = week.month;
    } else {
      monthGroups[monthGroups.length - 1].count++;
    }
  });

  // Calculate height for each area
  const getAreaHeight = (areaId: string) => {
    if (collapsedAreas.has(areaId)) return ROW_HEIGHT + AREA_GAP;
    const { totalHeight } = getProjectLayoutInArea(areaId);
    // Height based on actual content, plus gap between areas
    return totalHeight + AREA_GAP;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentYear(y => y - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold w-20 text-center">{currentYear}</span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentYear(y => y + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCurrentYear(new Date().getFullYear())}>
          This Year
        </Button>
      </div>

      {/* Timeline with swim lanes */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Left panel - Area headers only */}
          <div className="w-48 flex-shrink-0 border-r">
          {/* Header spacer */}
          <div className="h-[60px] border-b px-4 flex items-end pb-2 font-medium text-sm text-muted-foreground">
            Areas
          </div>

          {/* Area headers */}
          {areas.map(area => {
            const isCollapsed = collapsedAreas.has(area.id);
            const height = getAreaHeight(area.id);

            return (
              <div
                key={area.id}
                className="border-b"
                style={{ height }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-muted/50 h-[36px]"
                  onClick={() => toggleArea(area.id)}
                >
                  {isCollapsed ? (
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                  {area.icon && <span>{area.icon}</span>}
                  <span className="font-medium text-sm truncate" style={{ color: area.color }}>
                    {area.name}
                  </span>
                </div>
              </div>
            );
          })}

          {areas.length === 0 && (
            <div className="px-4 py-8 text-sm text-muted-foreground text-center">
              No scheduled projects
            </div>
          )}
          </div>

          {/* Right panel - Timeline grid */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto"
        >
          <div
            className="relative"
            style={{ width: weeks.length * WEEK_WIDTH }}
          >
            {/* Month headers */}
            <div className="sticky top-0 bg-background z-20 border-b">
              <div className="flex h-[30px]">
                {monthGroups.map(({ month, startIndex, count }) => (
                  <div
                    key={`${month}-${startIndex}`}
                    className="border-r flex items-center justify-center text-sm font-medium"
                    style={{ width: count * WEEK_WIDTH }}
                  >
                    {getShortMonthName(month)}
                  </div>
                ))}
              </div>

              {/* Week headers */}
              <div className="flex h-[30px]">
                {weeks.map((week) => (
                  <div
                    key={week.week}
                    className={cn(
                      "border-r flex items-center justify-center text-xs",
                      week.week === currentWeek && "bg-primary/20 font-medium"
                    )}
                    style={{ width: WEEK_WIDTH }}
                  >
                    W{week.weekInMonth}
                  </div>
                ))}
              </div>
            </div>

            {/* Swim lanes */}
            {areas.map(area => {
              const isCollapsed = collapsedAreas.has(area.id);
              const areaProjects = getScheduledByArea(area.id);
              const { getLayout } = getProjectLayoutInArea(area.id);
              const height = getAreaHeight(area.id);

              return (
                <div
                  key={area.id}
                  className="relative border-b"
                  style={{ height }}
                >
                  {/* Grid lines for this swim lane */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {weeks.map((week) => (
                      <div
                        key={week.week}
                        className={cn(
                          "border-r h-full",
                          week.week === currentWeek && "bg-primary/5"
                        )}
                        style={{ width: WEEK_WIDTH }}
                      />
                    ))}
                  </div>


                  {/* Project bars */}
                  {!isCollapsed && areaProjects.map(project => {
                    const barStyle = getProjectBarStyle(project);
                    const isDragging = dragState?.projectId === project.id;
                    const layout = getLayout(project.id);
                    const isMenuOpen = menuOpen && selectedProject?.id === project.id;

                    if (!barStyle) return null;

                    return (
                      <Popover
                        key={project.id}
                        open={isMenuOpen}
                        onOpenChange={(open) => {
                          // Don't open if we just finished dragging
                          if (open && justDraggedRef.current) return;
                          setMenuOpen(open);
                          if (open) setSelectedProject(project);
                          else setSelectedProject(null);
                        }}
                      >
                        <PopoverTrigger asChild>
                          <div
                            className={cn(
                              "absolute rounded cursor-grab active:cursor-grabbing select-none",
                              isDragging && "opacity-30"
                            )}
                            style={{
                              left: barStyle.left,
                              width: barStyle.width,
                              top: layout.top,
                              height: layout.height,
                              backgroundColor: `${area.color}40`,
                              border: `2px solid ${area.color}`,
                              overflow: "hidden",
                            }}
                            onMouseDown={(e) => handleBarDragStart(e, project, "move")}
                          >
                            {/* Left resize handle */}
                            <div
                              className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleBarDragStart(e, project, "resize-start");
                              }}
                            />

                            {/* Project name */}
                            <div
                              className="px-3 py-1 text-xs font-medium pointer-events-none leading-tight"
                              style={{ color: area.color }}
                            >
                              {project.name}
                            </div>

                            {/* Right resize handle */}
                            <div
                              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleBarDragStart(e, project, "resize-end");
                              }}
                            />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-1" align="start">
                          <button
                            onClick={() => handleOpenProject(project)}
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open Project
                          </button>
                          <button
                            onClick={() => handleUnscheduleProject(project)}
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted"
                          >
                            <CalendarOff className="h-4 w-4" />
                            Unschedule
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project)}
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                </div>
              );
            })}

            {areas.length === 0 && (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No areas created yet
              </div>
            )}
          </div>
        </div>
        </div>

      </div>
    </div>
  );
}
