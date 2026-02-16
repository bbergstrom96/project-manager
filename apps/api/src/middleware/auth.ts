import { Request, Response, NextFunction } from "express";

// Simple token - in production you'd use JWT
const generateToken = (password: string): string => {
  return Buffer.from(`auth:${password}:${Date.now()}`).toString("base64");
};

const validateToken = (token: string): boolean => {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [prefix, password] = decoded.split(":");
    return prefix === "auth" && password === process.env.AUTH_PASSWORD;
  } catch {
    return false;
  }
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip auth in development
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  // Skip auth for login endpoint and health check
  if (req.path === "/auth/login" || req.path === "/health") {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  if (!validateToken(token)) {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }

  next();
};

export const loginHandler = (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password || password !== process.env.AUTH_PASSWORD) {
    return res.status(401).json({ success: false, error: "Invalid password" });
  }

  const token = generateToken(password);
  res.json({ success: true, data: { token } });
};
