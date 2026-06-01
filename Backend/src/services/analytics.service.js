const mongoose = require("mongoose");
const Queue = require("../models/Queue");
const QueueLog = require("../models/QueueLog");

const validateQueueId = (queueId) => {
  if (!mongoose.Types.ObjectId.isValid(queueId)) {
    const error = new Error("Invalid queueId");
    error.statusCode = 400;
    throw error;
  }
};

const ensureQueueExists = async (queueId) => {
  const queue = await Queue.findById(queueId).select("_id");

  if (!queue) {
    const error = new Error("Queue not found");
    error.statusCode = 404;
    throw error;
  }
};

const getQueueLogs = async (queueId) => {
  validateQueueId(queueId);
  await ensureQueueExists(queueId);

  const logs = await QueueLog.find({ queueId }).sort({ timestamp: -1 }).limit(100);
  return logs;
};

const getTrend = async (queueId) => {
  validateQueueId(queueId);

  const [trendData] = await QueueLog.aggregate([
    {
      $match: {
        queueId: new mongoose.Types.ObjectId(queueId),
      },
    },
    {
      $sort: { timestamp: -1 },
    },
    {
      $facet: {
        recent: [{ $limit: 10 }],
        previous: [{ $skip: 10 }, { $limit: 10 }],
      },
    },
    {
      $project: {
        recentAvg: { $avg: "$recent.queueLength" },
        previousAvg: { $avg: "$previous.queueLength" },
      },
    },
  ]);

  if (!trendData || trendData.recentAvg == null || trendData.previousAvg == null) {
    return "stable";
  }

  if (trendData.recentAvg > trendData.previousAvg) {
    return "increasing";
  }

  if (trendData.recentAvg < trendData.previousAvg) {
    return "decreasing";
  }

  return "stable";
};

const calculateSummary = async (queueId) => {
  validateQueueId(queueId);
  await ensureQueueExists(queueId);

  const [summaryData] = await QueueLog.aggregate([
    {
      $match: {
        queueId: new mongoose.Types.ObjectId(queueId),
      },
    },
    {
      $facet: {
        actions: [
          {
            $group: {
              _id: "$action",
              count: { $sum: 1 },
            },
          },
        ],
        metrics: [
          {
            $group: {
              _id: null,
              avgQueueLength: { $avg: "$queueLength" },
              maxQueueLength: { $max: "$queueLength" },
            },
          },
        ],
      },
    },
  ]);

  const actions = summaryData?.actions || [];
  const metrics = summaryData?.metrics?.[0] || {};

  const joins = actions.find((a) => a._id === "JOIN");
  const leaves = actions.find((a) => a._id === "LEAVE");
  const trend = await getTrend(queueId);

  return {
    totalJoins: joins ? joins.count : 0,
    totalLeaves: leaves ? leaves.count : 0,
    avgQueueLength:
      typeof metrics.avgQueueLength === "number"
        ? Number(metrics.avgQueueLength.toFixed(2))
        : 0,
    maxQueueLength: metrics.maxQueueLength ?? 0,
    trend,
  };
};

const getPeakHours = async (queueId) => {
  validateQueueId(queueId);
  await ensureQueueExists(queueId);

  const [peak] = await QueueLog.aggregate([
    {
      $match: {
        queueId: new mongoose.Types.ObjectId(queueId),
      },
    },
    {
      $group: {
        _id: { $hour: "$timestamp" },
        activityCount: { $sum: 1 },
      },
    },
    {
      $sort: { activityCount: -1, _id: 1 },
    },
    {
      $limit: 1,
    },
  ]);

  if (!peak) {
    return {
      peakHour: null,
      activityCount: 0,
    };
  }

  return {
    peakHour: peak._id,
    activityCount: peak.activityCount,
  };
};

module.exports = {
  calculateSummary,
  getTrend,
  getPeakHours,
  getQueueLogs,
};
