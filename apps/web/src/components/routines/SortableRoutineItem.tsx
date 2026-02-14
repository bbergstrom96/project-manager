"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RoutineItemWithCompletion } from "@proj-mgmt/shared";

interface SortableRoutineItemProps {
  item: RoutineItemWithCompletion;
  sectionId: string;
  onToggle: (item: RoutineItemWithCompletion) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAddSubItem?: (parentId: string) => void;
  isSubItem?: boolean;
}

export function SortableRoutineItem({
  item,
  sectionId,
  onToggle,
  onUpdate,
  onDelete,
  onAddSubItem,
  isSubItem = false,
}: SortableRoutineItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: 'item',
      item,
      sectionId,
      isSubItem,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(item.name);
  }, [item.name]);

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== item.name) {
      onUpdate(item.id, editValue.trim());
    } else {
      setEditValue(item.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(item.name);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 py-2.5 md:py-1.5 px-2 group rounded-md hover:bg-muted/50 transition-colors",
        isDragging && "opacity-0"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 100)}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground md:opacity-0 md:group-hover:opacity-100 touch-none p-1"
      >
        <GripVertical className="h-5 w-5 md:h-4 md:w-4" />
      </div>
      <Checkbox
        checked={item.isCompleted}
        onCheckedChange={() => onToggle(item)}
        className="h-5 w-5 md:h-4 md:w-4"
      />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 text-sm bg-transparent border-b border-primary outline-none"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={cn(
            "flex-1 text-sm cursor-text",
            item.isCompleted && "line-through text-muted-foreground"
          )}
        >
          {item.name}
        </span>
      )}
      {item.isTrackable && (
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          tracked
        </span>
      )}
      <div className={cn("flex items-center gap-1", !isHovered && "md:opacity-0")}>
        {!isSubItem && onAddSubItem && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:h-6 md:w-6 text-muted-foreground hover:text-foreground"
            onClick={() => onAddSubItem(item.id)}
            title="Add subtask"
          >
            <Plus className="h-4 w-4 md:h-3 md:w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:h-6 md:w-6 text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4 md:h-3 md:w-3" />
        </Button>
      </div>
    </div>
  );
}

// Overlay component for drag preview
export function RoutineItemOverlay({ item }: { item: RoutineItemWithCompletion }) {
  return (
    <div className="flex items-center gap-2 py-2.5 md:py-1.5 px-2 bg-[#2d2d2d] rounded-md shadow-2xl border border-[#3d3d3d]">
      <Checkbox checked={item.isCompleted} disabled className="h-5 w-5 md:h-4 md:w-4" />
      <span className={cn(
        "flex-1 text-sm",
        item.isCompleted && "line-through text-muted-foreground"
      )}>
        {item.name}
      </span>
      {item.isTrackable && (
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          tracked
        </span>
      )}
    </div>
  );
}
