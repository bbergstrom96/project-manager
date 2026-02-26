import { createServer } from "http";
import app from "./app";
import { initializeSocketServer } from "./socket/socketServer";

const PORT = process.env.API_PORT || 3001;

const httpServer = createServer(app);
initializeSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`WebSocket server ready`);
});
