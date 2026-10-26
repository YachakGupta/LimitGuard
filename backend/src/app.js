
import express from "express";
import cors from "cors";
import helmet from "helmet";

import healthRouter from "./routes/healthRoutes.js";
import contextRouter from "./routes/contextRoutes.js";
import { errorMiddleware } from "./middlewares/error.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API routes
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/context", contextRouter);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "AI Context Firewall backend is running!",
  });
});


app.use(errorMiddleware);

export default app;
