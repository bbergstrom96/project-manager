"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Calendar,
  CalendarDays,
  Hash,
  Plus,
  ChevronDown,
  ChevronRight,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useProjectStore } from "@/stores/projectStore";
import { useLabelStore } from "@/stores/labelStore";
import { useUIStore } from "@/stores/uiStore";
import { useState } from "react";

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

export function Sidebar() {
  const { sidebarOpen, setAddTaskOpen } = useUIStore();
  const { projects, fetchProjects } = useProjectStore();
  const { labels, fetchLabels } = useLabelStore();

  useEffect(() => {
    fetchProjects();
    fetchLabels();
  }, [fetchProjects, fetchLabels]);

  if (!sidebarOpen) return null;

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background">
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
          label="Upcoming"
        />

        <Separator className="my-4" />

        <CollapsibleSection title="Projects">
          {projects.map((project) => (
            <NavItem
              key={project.id}
              href={`/projects/${project.id}`}
              icon={
                <FolderKanban
                  className="h-4 w-4"
                  style={{ color: project.color }}
                />
              }
              label={project.name}
              count={project._count.tasks}
              color={project.color}
            />
          ))}
        </CollapsibleSection>

        <Separator className="my-4" />

        <CollapsibleSection title="Labels">
          {labels.map((label) => (
            <NavItem
              key={label.id}
              href={`/labels/${label.id}`}
              icon={<Hash className="h-4 w-4" style={{ color: label.color }} />}
              label={label.name}
              count={label._count.tasks}
              color={label.color}
            />
          ))}
        </CollapsibleSection>
      </nav>
    </aside>
  );
}
