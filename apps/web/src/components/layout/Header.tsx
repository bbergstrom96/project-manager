"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <header className="flex h-14 items-center gap-2 md:gap-4 border-b px-3 md:px-6">
      {/* Show hamburger when sidebar is closed */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(true)}
        className={cn("h-10 w-10 md:h-9 md:w-9", sidebarOpen && "hidden")}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-semibold flex-1">{title}</h1>
      {actions}
    </header>
  );
}
