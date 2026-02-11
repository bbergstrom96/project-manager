"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { TaskList } from "@/components/tasks/TaskList";
import { api } from "@/lib/api";
import type { Label } from "@proj-mgmt/shared";

export default function LabelPage() {
  const params = useParams();
  const labelId = params.labelId as string;
  const [label, setLabel] = useState<Label | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLabel() {
      try {
        const data = await api.labels.get(labelId);
        setLabel(data);
      } catch (error) {
        console.error("Failed to load label:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadLabel();
  }, [labelId]);

  if (isLoading) {
    return (
      <div className="h-full">
        <Header title="Loading..." />
        <div className="p-6 max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!label) {
    return (
      <div className="h-full">
        <Header title="Label not found" />
        <div className="p-6 max-w-3xl mx-auto">
          <p className="text-muted-foreground">
            This label does not exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Header title={`#${label.name}`} />
      <div className="p-6 max-w-3xl mx-auto">
        <TaskList filters={{ labelId }} />
      </div>
    </div>
  );
}
