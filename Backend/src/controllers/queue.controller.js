const queueService = require("../services/queue.service");

/**
 * GET /api/queue/list — List queues
 */
const listQueues = async (req, res, next) => {
  try {
    const queues = await queueService.listQueues();

    res.status(200).json({
      success: true,
      count: queues.length,
      data: queues,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/queue/create — Create a new queue
 */
const createQueue = async (req, res, next) => {
  try {
    const { name, serviceRate } = req.body;

    if (!name || !serviceRate) {
      const error = new Error("Name and serviceRate are required");
      error.statusCode = 400;
      throw error;
    }

    const queue = await queueService.createQueue({
      name,
      serviceRate,
      createdBy: req.user ? req.user._id : null,
    });

    res.status(201).json({
      success: true,
      message: "Queue created successfully",
      data: queue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/queue/join/:id — Join a queue
 */
const joinQueue = async (req, res, next) => {
  try {
    const { queue, waitTime } = await queueService.joinQueue(req.params.id);

    res.status(200).json({
      success: true,
      message: "Joined the queue",
      data: {
        queueName: queue.name,
        currentLength: queue.currentLength,
        estimatedWaitTime: `${waitTime} minutes`,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/queue/leave/:id — Leave a queue
 */
const leaveQueue = async (req, res, next) => {
  try {
    const { queue, waitTime } = await queueService.leaveQueue(req.params.id);

    res.status(200).json({
      success: true,
      message: "Left the queue",
      data: {
        queueName: queue.name,
        currentLength: queue.currentLength,
        estimatedWaitTime: `${waitTime} minutes`,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/queue/:id — Get queue status
 */
const getQueueStatus = async (req, res, next) => {
  try {
    const status = await queueService.getQueueStatus(req.params.id);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listQueues,
  createQueue,
  joinQueue,
  leaveQueue,
  getQueueStatus,
};
