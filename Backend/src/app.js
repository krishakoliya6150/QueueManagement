const express = require("express");
const cors = require("cors");

// Import routes
const queueRoutes = require("./routes/queue.routes");
const authRoutes = require("./routes/auth.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const predictRoutes = require("./routes/predict.routes");

// Import error middleware
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

function parseClientOrigins() {
  const raw = process.env.CLIENT_ORIGIN;
  if (!raw || raw === "*") return null;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

// ─── Global Middleware ───────────────────────────────────────
const clientOrigins = parseClientOrigins();
if (clientOrigins?.length) {
  app.use(cors({ origin: clientOrigins, credentials: true }));
} else {
  app.use(cors());
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 QueueSense API is running!",
  });
});

// ─── API Routes ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/predict", predictRoutes);

// ─── Error Handling ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
