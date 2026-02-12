"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/stores/projectStore";
import {
  getWeeksForMonth,
  getMonthName,
  getCurrentWeek,
} from "@/lib/weeks";
import { ProjectPlanningDialog } from "./ProjectPlanningDialog";
import type { Area, Project } from "@proj-mgmt/shared";

interface AreaWithProjects extends Area {
  projects: Project[];
}

interface PlanningGridProps {
  areas: AreaWithProjects[];
  viewMode: "month" | "quarter";
}

interface Column {
  label: string;
  period: string; // "M.W" format for weeks, "M" for months
  month: number;
  weekInMonth?: number;
  isCurrent?: boolean;
}

// Check if a project spans a given period
function projectSpansPeriod(
  project: Project,
  period: string,
  viewMode: "month" | "quarter"
): boolean {
  if (!project.startWeek || !project.endWeek) return false;

  if (viewMode === "quarter") {
    // Period is just month number like "3"
    const monthNum = parseInt(period);
    const [startMonth] = project.startWeek.split(".").map(Number);
    const [endMonth] = project.endWeek.split(".").map(Number);
    return monthNum >= startMonth && monthNum <= endMonth;
  } else {
    // Period is "M.W" format
    const [periodMonth, periodWeek] = period.split(".").map(Number);
    const [startMonth, startWeek] = project.startWeek.split(".").map(Number);
    const [endMonth, endWeek] = project.endWeek.split(".").map(Number);

    const periodVal = periodMonth * 10 + periodWeek;
    const startVal = startMonth * 10 + startWeek;
    const endVal = endMonth * 10 + endWeek;

    return periodVal >= startVal && periodVal <= endVal;
  }
}

export function PlanningGrid({ areas, viewMode }: PlanningGridProps) {
  const { projects, fetchProjects } = useProjectStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [defaultPeriod, setDefaultPeriod] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Generate columns based on view mode
  const columns: Column[] = [];
  const { week: currentWeekStr } = getCurrentWeek();

  if (viewMode === "month") {
    // Show weeks for the current month
    const weeks = getWeeksForMonth(year, month);
    weeks.forEach((w) => {
      const isCurrent = w.week === currentWeekStr;
      columns.push({
        label: `Week ${w.weekInMonth}`,
        period: w.week,
        month: w.month,
        weekInMonth: w.weekInMonth,
        isCurrent,
      });
    });
  } else {
    // Show 3 months for the quarter
    const quarterStart = Math.floor((month - 1) / 3) * 3 + 1;
    for (let m = quarterStart; m < quarterStart + 3; m++) {
      const isCurrent = m === month;
      columns.push({
        label: getMonthName(m),
        period: String(m),
        month: m,
        isCurrent,
      });
    }
  }

  const navigateMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + delta);
    } else {
      newDate.setMonth(newDate.getMonth() + delta * 3);
    }
    setCurrentDate(newDate);
  };

  const getQuarterLabel = () => {
    const quarter = Math.floor((month - 1) / 3) + 1;
    return `Q${quarter} ${year}`;
  };

  const handleCellClick = (areaId: string, period: string) => {
    setSelectedArea(areaId);
    setSelectedProject(null);
    setDefaultPeriod(period);
    setDialogOpen(true);
  };

  const handleProjectClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedArea(project.areaId);
    setSelectedProject(project);
    setDefaultPeriod(null);
    setDialogOpen(true);
  };

  // Get projects for an area that span a given period
  const getProjectsForCell = (areaId: string, period: string): Project[] => {
    return projects.filter(
      (p) =>
        p.areaId === areaId &&
        !p.isArchived &&
        projectSpansPeriod(p, period, viewMode)
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold w-40 text-center">
            {viewMode === "month"
              ? `${getMonthName(month)} ${year}`
              : getQuarterLabel()}
          </span>
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentDate(new Date())}
        >
          Today
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          {/* Header row */}
          <div className="flex sticky top-0 bg-background z-10 border-b">
            <div className="w-48 flex-shrink-0 px-4 py-3 font-medium border-r">
              Area
            </div>
            {columns.map((col) => (
              <div
                key={col.period}
                className={`w-56 flex-shrink-0 px-4 py-3 font-medium border-r text-center ${
                  col.isCurrent ? "bg-primary/10" : ""
                }`}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Area rows */}
          {areas.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No areas yet. Click &quot;Add Area&quot; to create life areas like
              Personal, Professional, etc.
            </div>
          ) : (
            areas.map((area) => (
              <div key={area.id} className="flex border-b">
                <div className="w-48 flex-shrink-0 px-4 py-3 border-r">
                  <div className="flex items-center gap-2">
                    {area.icon && <span>{area.icon}</span>}
                    <span className="font-medium" style={{ color: area.color }}>
                      {area.name}
                    </span>
                  </div>
                </div>
                {columns.map((col) => {
                  const cellProjects = getProjectsForCell(area.id, col.period);
                  return (
                    <div
                      key={col.period}
                      onClick={() => handleCellClick(area.id, col.period)}
                      className={`w-56 flex-shrink-0 px-2 py-2 border-r cursor-pointer hover:bg-muted/50 min-h-[80px] ${
                        col.isCurrent ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="space-y-1">
                        {cellProjects.map((project) => (
                          <div
                            key={project.id}
                            onClick={(e) => handleProjectClick(project, e)}
                            className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80"
                            style={{
                              backgroundColor: `${project.color}30`,
                              color: project.color,
                            }}
                            title={project.name}
                          >
                            {project.name}
                          </div>
                        ))}
                        {cellProjects.length === 0 && (
                          <div className="text-muted-foreground text-xs flex items-center justify-center h-full opacity-0 hover:opacity-100">
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      <ProjectPlanningDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        areaId={selectedArea}
        project={selectedProject}
        defaultPeriod={defaultPeriod}
        viewMode={viewMode}
        year={year}
      />
    </div>
  );
}
