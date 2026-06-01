const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const analyticsService = require("../services/analytics.service");

/** @type {import('socket.io').Server | null} */
let io = null;

function parseAllowedOrigins() {
  const raw = process.env.CLIENT_ORIGIN;
  if (!raw || raw === "*") {
    return ["http://localhost:5173", "http://127.0.0.1:5173"];
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

/**
 * Attach Socket.IO to the HTTP server (not raw Express listen).
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: parseAllowedOrigins(),
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        const err = new Error("Authentication required");
        err.data = { code: "NO_TOKEN" };
        return next(err);
      }
      jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      const err = new Error("Authentication failed");
      err.data = { code: "INVALID_TOKEN" };
      next(err);
    }
  });

  io.on("connection", (socket) => {
    socket.emit("connected", { socketId: socket.id });
  });

  return io;
}

function getIO() {
  return io;
}

/**
 * After queue mutations: notify all clients with queue snapshot + fresh analytics summary.
 */
async function notifyQueueSubscribers(queueId, currentLength, waitTime) {
  const socket = getIO();
  if (!socket) return;

  socket.emit("queueUpdated", {
    queueId,
    currentLength,
    waitTime,
  });

  try {
    const summary = await analyticsService.calculateSummary(queueId);
    socket.emit("analyticsUpdated", {
      queueId,
      summary,
    });
  } catch (err) {
    console.error("[socket] analyticsUpdated failed:", err.message);
  }
}

module.exports = {
  initSocket,
  getIO,
  notifyQueueSubscribers,
};
