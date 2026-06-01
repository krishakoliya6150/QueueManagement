const express = require("express");
const router = express.Router();
const {
  getQueueLogs,
  getQueueSummary,
  getQueuePeakHours,
} = require("../controllers/analytics.controller");

router.get("/logs/:queueId", getQueueLogs);
router.get("/summary/:queueId", getQueueSummary);
router.get("/peak-hours/:queueId", getQueuePeakHours);

module.exports = router;
