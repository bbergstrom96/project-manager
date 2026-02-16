import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { authMiddleware, loginHandler } from "./middleware/auth";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Auth
app.use("/api/v1", authMiddleware);
app.post("/api/v1/auth/login", loginHandler);

// Routes
app.use("/api/v1", routes);

// Error handling (must be last)
app.use(errorHandler);

export default app;
