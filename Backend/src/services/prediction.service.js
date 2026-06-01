const mongoose = require("mongoose");
const QueueLog = require("../models/QueueLog");

/**
 * Basic fallback formula.
 */
const calculateWaitTime = (currentLength, serviceRate) => {
  if (serviceRate <= 0) return 0;
  const waitTime = currentLength / serviceRate;
  return Math.round(waitTime * 100) / 100;
};

const ML_BASE_URL = (process.env.ML_SERVICE_URL || "http://localhost:8000").replace(/\/+$/, "");

// Node 18+ has global fetch. If not available, fall back to node-fetch (CJS).
// eslint-disable-next-line no-undef
const fetchFn = typeof fetch !== "undefined" ? fetch : require("node-fetch");

async function getRecentActivity(queueId, windowMinutes = 15) {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  const counts = await QueueLog.aggregate([
    {
      $match: {
        queueId: new mongoose.Types.ObjectId(queueId),
        timestamp: { $gte: since },
      },
    },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
      },
    },
  ]);

  let joins = 0;
  let leaves = 0;
  for (const row of counts) {
    if (row._id === "JOIN") joins = row.count;
    if (row._id === "LEAVE") leaves = row.count;
  }

  return {
    activityCount: joins + leaves,
    recentJoins: joins,
    recentLeaves: leaves,
  };
}

async function postJson(url, payload, timeoutMs = 1500) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`ML service error (${res.status}): ${text || res.statusText}`);
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/**
 * Smart prediction via ML service. Falls back to formula on any failure.
 */
async function predictWaitTime({ queueId, currentLength, serviceRate }) {
  try {
    const now = new Date();
    const { activityCount, recentJoins, recentLeaves } = await getRecentActivity(queueId, 15);

    const payload = {
      currentLength,
      serviceRate,
      hourOfDay: now.getHours(),
      activityCount,
      recentJoins,
      recentLeaves,
    };

    const result = await postJson(`${ML_BASE_URL}/predict`, payload);
    const predicted = Number(result?.predictedWaitTime);

    if (!Number.isFinite(predicted) || predicted < 0) {
      return calculateWaitTime(currentLength, serviceRate);
    }

    return Math.round(predicted * 100) / 100;
  } catch {
    return calculateWaitTime(currentLength, serviceRate);
  }
}

module.exports = { calculateWaitTime, predictWaitTime };
