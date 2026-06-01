const predictionService = require("../services/prediction.service");
const Queue = require("../models/Queue");

/**
 * GET /api/predict/:queueId
 * Returns smart predicted wait time (minutes).
 */
const getPrediction = async (req, res, next) => {
  try {
    const { queueId } = req.params;

    const queue = await Queue.findById(queueId).select(
      "_id currentLength serviceRate"
    );

    if (!queue) {
      const error = new Error("Queue not found");
      error.statusCode = 404;
      throw error;
    }

    const predictedWaitTime = await predictionService.predictWaitTime({
      queueId: queue._id.toString(),
      currentLength: queue.currentLength,
      serviceRate: queue.serviceRate,
    });

    res.status(200).json({
      success: true,
      data: { predictedWaitTime },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPrediction };

