"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  isOver?: boolean;
}

export function DroppableColumn({ id, children, isOver: isOverProp }: DroppableColumnProps) {
  const { isOver: isOverDroppable, setNodeRef } = useDroppable({
    id,
  });

  // Use the prop if provided (for controlled highlighting), otherwise use the hook's value
  const showHighlight = isOverProp ?? isOverDroppable;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-colors rounded-lg",
        showHighlight && "bg-primary/5 ring-2 ring-primary/20"
      )}
    >
      {children}
    </div>
  );
}
