"use client";

import { Header } from "@/components/layout/Header";
import { TaskList } from "@/components/tasks/TaskList";

export default function UpcomingPage() {
  return (
    <div className="h-full">
      <Header title="Upcoming" />
      <div className="p-6 max-w-3xl mx-auto">
        <TaskList filters={{ dueDate: "upcoming" }} />
      </div>
    </div>
  );
}
