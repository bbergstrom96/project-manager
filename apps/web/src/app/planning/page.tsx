"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { PlanningGrid } from "@/components/planning/PlanningGrid";
import { AddAreaDialog } from "@/components/planning/AddAreaDialog";
import { useAreaStore } from "@/stores/areaStore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "month" | "quarter";

export default function PlanningPage() {
  const { areas, fetchAreas, isLoading } = useAreaStore();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [addAreaOpen, setAddAreaOpen] = useState(false);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  return (
    <div className="h-full flex flex-col">
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

      {/* View mode tabs */}
      <div className="flex items-center gap-2 px-6 py-3 border-b">
        <button
          onClick={() => setViewMode("month")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            viewMode === "month"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          This Month
        </button>
        <button
          onClick={() => setViewMode("quarter")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            viewMode === "quarter"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          This Quarter
        </button>
      </div>

      {/* Planning grid */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          </div>
        ) : (
          <PlanningGrid areas={areas} viewMode={viewMode} />
        )}
      </div>

      <AddAreaDialog open={addAreaOpen} onOpenChange={setAddAreaOpen} />
    </div>
  );
}
