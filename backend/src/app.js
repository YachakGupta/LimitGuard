import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import healthRouter from "./routes/healthRoutes.js";
import contextRouter from "./routes/contextRoutes.js";
import authRouter from "./routes/authRoutes.js";
import conversationRouter from "./routes/conversationRoutes.js";
import extensionTokenRouter from "./routes/extensionTokenRoutes.js";
import analyticsRouter from "./routes/analyticsRoutes.js";

import { errorMiddleware } from "./middlewares/error.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/context", contextRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/conversations", conversationRouter);

app.use("/api/v1/extension-token", extensionTokenRouter);
app.use("/api/v1/analytics", analyticsRouter);

app.get("/", (req, res) => {
  res.json({
    message: "AI Context Firewall backend is running!",
  });
});

app.use(errorMiddleware);

export default app;