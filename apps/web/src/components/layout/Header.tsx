"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/uiStore";

interface HeaderProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="flex h-14 items-center gap-4 border-b px-6">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
      <h1 className="text-lg font-semibold flex-1">{title}</h1>
      {actions}
    </header>
  );
}
