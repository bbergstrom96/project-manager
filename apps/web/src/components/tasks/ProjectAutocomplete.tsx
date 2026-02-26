"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  extractCurrentProjectQuery,
  getProjectSuggestions,
  replaceProjectQuery,
  type Project,
} from "@/lib/taskParser";

interface ProjectWithColor extends Project {
  color: string;
}

interface ProjectAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onProjectSelect: (projectId: string) => void;
  projects: ProjectWithColor[];
  inputRef: React.RefObject<HTMLInputElement>;
  className?: string;
}

export function ProjectAutocomplete({
  value,
  onChange,
  onProjectSelect,
  projects,
  inputRef,
  className,
}: ProjectAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<ProjectWithColor[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [queryInfo, setQueryInfo] = useState<{
    query: string;
    startIndex: number;
    endIndex: number;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update suggestions when value or cursor changes
  const updateSuggestions = useCallback(() => {
    if (!inputRef.current) return;

    const cursorPosition = inputRef.current.selectionStart ?? value.length;
    const info = extractCurrentProjectQuery(value, cursorPosition);

    if (info) {
      setQueryInfo(info);
      // Filter projects directly (getProjectSuggestions returns Project[], we need ProjectWithColor[])
      const lowerQuery = info.query.toLowerCase();
      const filtered = info.query
        ? projects.filter((p) => p.name.toLowerCase().includes(lowerQuery))
        : projects;
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setIsOpen(false);
      setQueryInfo(null);
    }
  }, [value, projects, inputRef]);

  // Check for # on every value change
  useEffect(() => {
    updateSuggestions();
  }, [updateSuggestions]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputRef]);

  const selectProject = useCallback(
    (project: ProjectWithColor) => {
      if (!queryInfo) return;

      const newValue = replaceProjectQuery(
        value,
        queryInfo.startIndex,
        queryInfo.endIndex,
        project.name
      );
      onChange(newValue);
      onProjectSelect(project.id);
      setIsOpen(false);

      // Restore focus to input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    },
    [queryInfo, value, onChange, onProjectSelect, inputRef]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          if (suggestions[selectedIndex]) {
            e.preventDefault();
            selectProject(suggestions[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, suggestions, selectedIndex, selectProject]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, isOpen]);

  return (
    <div className={cn("relative", className)}>
      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#1e1e1e] border border-[#3d3d3d] rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((project, index) => (
            <button
              key={project.id}
              data-index={index}
              type="button"
              onClick={() => selectProject(project)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
                index === selectedIndex
                  ? "bg-[#2d2d2d] text-zinc-100"
                  : "text-zinc-300 hover:bg-[#2d2d2d]"
              )}
            >
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span>{project.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Expose handleKeyDown for parent to use */}
    </div>
  );
}

// Hook version for easier integration
export function useProjectAutocomplete(
  value: string,
  onChange: (value: string) => void,
  onProjectSelect: (projectId: string) => void,
  projects: ProjectWithColor[],
  inputRef: React.RefObject<HTMLInputElement>
) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<ProjectWithColor[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [queryInfo, setQueryInfo] = useState<{
    query: string;
    startIndex: number;
    endIndex: number;
  } | null>(null);

  const updateSuggestions = useCallback(() => {
    if (!inputRef.current) return;

    const cursorPosition = inputRef.current.selectionStart ?? value.length;
    const info = extractCurrentProjectQuery(value, cursorPosition);

    if (info) {
      setQueryInfo(info);
      // Filter projects directly
      const lowerQuery = info.query.toLowerCase();
      const filtered = info.query
        ? projects.filter((p) => p.name.toLowerCase().includes(lowerQuery))
        : projects;
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setIsOpen(false);
      setQueryInfo(null);
    }
  }, [value, projects, inputRef]);

  useEffect(() => {
    updateSuggestions();
  }, [updateSuggestions]);

  const selectProject = useCallback(
    (project: ProjectWithColor) => {
      if (!queryInfo) return;

      const newValue = replaceProjectQuery(
        value,
        queryInfo.startIndex,
        queryInfo.endIndex,
        project.name
      );
      onChange(newValue);
      onProjectSelect(project.id);
      setIsOpen(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    },
    [queryInfo, value, onChange, onProjectSelect, inputRef]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): boolean => {
      if (!isOpen) return false;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          return true;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          return true;
        case "Enter":
          if (suggestions[selectedIndex]) {
            e.preventDefault();
            selectProject(suggestions[selectedIndex]);
            return true;
          }
          return false;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          return true;
        case "Tab":
          setIsOpen(false);
          return false;
      }
      return false;
    },
    [isOpen, suggestions, selectedIndex, selectProject]
  );

  const close = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    suggestions,
    selectedIndex,
    handleKeyDown,
    selectProject,
    close,
  };
}
