"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DroppableRowProps {
  id: string;
  children: React.ReactNode;
  isOver?: boolean;
}

export function DroppableRow({ id, children, isOver: isOverProp }: DroppableRowProps) {
  const { isOver: isOverDroppable, setNodeRef } = useDroppable({
    id,
  });

  const showHighlight = isOverProp ?? isOverDroppable;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-colors rounded-lg p-3 -m-3",
        showHighlight && "bg-primary/5 ring-2 ring-primary/20"
      )}
    >
      {children}
    </div>
  );
}
