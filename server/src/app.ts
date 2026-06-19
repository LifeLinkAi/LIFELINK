import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { logger } from "./utils/logger";
import apiRouter from "./routes";
import { errorHandler, ApiError } from "./middlewares/error.middleware";

const app = express();

// Security middleware to set various HTTP response headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://lifelink-client-coral.vercel.app",
      "http://localhost:3001",
    ],
    credentials: true,
  }),
);

// Compress response bodies for all requests
app.use(compression());

// Parse Cookie header and populate req.cookies
app.use(cookieParser());

// Parse incoming request bodies in JSON format
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Route HTTP request log messages into Winston logger
const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: morganStream,
  }),
);

// Apply rate limiting to all requests starting with /api or /api/v1
const isDev = process.env.NODE_ENV !== "production";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Prod: 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes",
  skip: (req) => isDev, // Skip rate limiting entirely in development
});
app.use(["/api", "/api/v1"], limiter);

// Root path confirmation check
app.get("/", (req, res) => {
  res.send("LifeLink Backend Running 🚀");
});

// Mount main application router under /api and /api/v1 for compatibility
app.use(["/api", "/api/v1"], apiRouter);

// Catch-all route handler for non-existent routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Register global error handling middleware
app.use(errorHandler);

export default app;
