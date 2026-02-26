import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

export function initializeSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
      credentials: process.env.CORS_ORIGIN ? true : false,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export function emitTaskEvent(
  event: "task:created" | "task:updated" | "task:deleted" | "task:completed",
  data: any
) {
  if (io) {
    io.emit(event, data);
  }
}

export function emitProjectEvent(
  event: "project:created" | "project:updated" | "project:deleted",
  data: any
) {
  if (io) {
    io.emit(event, data);
  }
}
