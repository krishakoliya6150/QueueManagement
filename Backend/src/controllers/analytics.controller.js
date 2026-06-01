const analyticsService = require("../services/analytics.service");

/**
 * GET /api/analytics/logs/:queueId — Get logs for a specific queue
 */
const getQueueLogs = async (req, res, next) => {
  try {
    const logs = await analyticsService.getQueueLogs(req.params.queueId);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/summary/:queueId — Get join/leave summary
 */
const getQueueSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.calculateSummary(req.params.queueId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/peak-hours/:queueId — Get most active hour
 */
const getQueuePeakHours = async (req, res, next) => {
  try {
    const peakHours = await analyticsService.getPeakHours(req.params.queueId);

    res.status(200).json({
      success: true,
      data: peakHours,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getQueueLogs, getQueueSummary, getQueuePeakHours };
