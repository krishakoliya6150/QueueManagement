const express = require("express");
const router = express.Router();
const {
  listQueues,
  createQueue,
  joinQueue,
  leaveQueue,
  getQueueStatus,
} = require("../controllers/queue.controller");

// GET /api/queue/list (must be before /:id)
router.get("/list", listQueues);

// POST /api/queue/create
router.post("/create", createQueue);

// POST /api/queue/join/:id
router.post("/join/:id", joinQueue);

// POST /api/queue/leave/:id
router.post("/leave/:id", leaveQueue);

// GET /api/queue/:id
router.get("/:id", getQueueStatus);

module.exports = router;
