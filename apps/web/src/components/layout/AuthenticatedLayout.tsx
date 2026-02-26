"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { AddTaskDialog } from "@/components/tasks/AddTaskDialog";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useRealtimeSync();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#1b1e25' }}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full" style={{ backgroundColor: '#1b1e25' }}>
          {children}
        </main>
      </div>
      <AddTaskDialog />
    </>
  );
}
