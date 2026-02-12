"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { ProjectTimeline } from "@/components/planning/ProjectTimeline";
import { PlanningNotes } from "@/components/planning/PlanningNotes";
import { AddAreaDialog } from "@/components/planning/AddAreaDialog";
import { useAreaStore } from "@/stores/areaStore";
import { Button } from "@/components/ui/button";
import { Plus, GripHorizontal } from "lucide-react";

const MIN_NOTES_HEIGHT = 36; // Just the drag handle visible
const DEFAULT_NOTES_HEIGHT = 36; // Start collapsed

export default function PlanningPage() {
  const { areas, fetchAreas, isLoading } = useAreaStore();
  const [addAreaOpen, setAddAreaOpen] = useState(false);
  const [notesHeight, setNotesHeight] = useState(DEFAULT_NOTES_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // Load saved height from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("planning-notes-height");
    if (saved) {
      setNotesHeight(Math.max(MIN_NOTES_HEIGHT, parseInt(saved, 10)));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = notesHeight;
  }, [notesHeight]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = dragStartY.current - e.clientY;
      const newHeight = Math.max(MIN_NOTES_HEIGHT, dragStartHeight.current + deltaY);
      const containerHeight = containerRef.current?.clientHeight || 600;
      const maxHeight = containerHeight - 200; // Leave at least 200px for timeline
      setNotesHeight(Math.min(newHeight, maxHeight));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem("planning-notes-height", notesHeight.toString());
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, notesHeight]);

  const isCollapsed = notesHeight <= MIN_NOTES_HEIGHT + 10;

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <Header
        title="Planning"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddAreaOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Area
          </Button>
        }
      />

      {/* Timeline and Unscheduled Projects */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          </div>
        ) : (
          <ProjectTimeline areas={areas} />
        )}
      </div>

      {/* Resizable Planning Notes */}
      <div
        style={{ height: notesHeight }}
        className="flex flex-col shrink-0 border-t border-border"
      >
        {/* Drag handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`
            h-[36px] flex items-center justify-center gap-2 cursor-ns-resize
            bg-muted/30 hover:bg-muted/50 transition-colors border-b border-border
            ${isDragging ? "bg-muted/50" : ""}
          `}
        >
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">
            Planning Notes
          </span>
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Notes content - only render when expanded */}
        {!isCollapsed && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <PlanningNotes hideHeader />
          </div>
        )}
      </div>

      <AddAreaDialog open={addAreaOpen} onOpenChange={setAddAreaOpen} />
    </div>
  );
}
