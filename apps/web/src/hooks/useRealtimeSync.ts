"use client";

import { useEffect } from "react";
import { useSocket } from "./useSocket";
import { useTaskStore } from "@/stores/taskStore";
import { useProjectStore } from "@/stores/projectStore";

export function useRealtimeSync() {
  const { socket, isConnected } = useSocket();
  const invalidateTasks = useTaskStore((state) => state.invalidate);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTaskEvent = () => {
      invalidateTasks();
      fetchTasks(true);
    };

    const handleProjectEvent = () => {
      fetchProjects();
    };

    socket.on("task:created", handleTaskEvent);
    socket.on("task:updated", handleTaskEvent);
    socket.on("task:deleted", handleTaskEvent);
    socket.on("task:completed", handleTaskEvent);
    socket.on("project:created", handleProjectEvent);
    socket.on("project:updated", handleProjectEvent);
    socket.on("project:deleted", handleProjectEvent);

    return () => {
      socket.off("task:created", handleTaskEvent);
      socket.off("task:updated", handleTaskEvent);
      socket.off("task:deleted", handleTaskEvent);
      socket.off("task:completed", handleTaskEvent);
      socket.off("project:created", handleProjectEvent);
      socket.off("project:updated", handleProjectEvent);
      socket.off("project:deleted", handleProjectEvent);
    };
  }, [socket, isConnected, invalidateTasks, fetchTasks, fetchProjects]);

  return { isConnected };
}
