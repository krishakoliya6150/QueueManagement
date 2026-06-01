const Queue = require("../models/Queue");
const QueueLog = require("../models/QueueLog");
const { notifyQueueSubscribers } = require("../socket/socket");
const { predictWaitTime } = require("./prediction.service");

/**
 * List queues (most recently updated first).
 */
const listQueues = async () => {
  return Queue.find().sort({ updatedAt: -1 }).limit(200).lean();
};

/**
 * Create a new queue.
 */
const createQueue = async ({ name, serviceRate, createdBy }) => {
  const queue = await Queue.create({
    name,
    serviceRate,
    createdBy: createdBy || null,
  });

  return queue;
};

/**
 * Join a queue — increment currentLength and log it.
 */
const joinQueue = async (queueId) => {
  const queue = await Queue.findById(queueId);

  if (!queue) {
    const error = new Error("Queue not found");
    error.statusCode = 404;
    throw error;
  }

  // Increment length
  queue.currentLength += 1;
  await queue.save();

  // Log the action
  await QueueLog.create({
    queueId: queue._id,
    action: "JOIN",
    queueLength: queue.currentLength,
  });

  // Calculate wait time
  const waitTime = await predictWaitTime({
    queueId: queue._id.toString(),
    currentLength: queue.currentLength,
    serviceRate: queue.serviceRate,
  });

  notifyQueueSubscribers(queue._id.toString(), queue.currentLength, waitTime).catch((err) =>
    console.error("[queue] socket notify failed:", err.message)
  );

  return {
    queue,
    waitTime,
  };
};

/**
 * Leave a queue — decrement currentLength (prevent negative) and log it.
 */
const leaveQueue = async (queueId) => {
  const queue = await Queue.findById(queueId);

  if (!queue) {
    const error = new Error("Queue not found");
    error.statusCode = 404;
    throw error;
  }

  if (queue.currentLength <= 0) {
    const error = new Error("Queue is already empty");
    error.statusCode = 400;
    throw error;
  }

  // Decrement length (prevent negative)
  queue.currentLength = Math.max(0, queue.currentLength - 1);
  await queue.save();

  // Log the action
  await QueueLog.create({
    queueId: queue._id,
    action: "LEAVE",
    queueLength: queue.currentLength,
  });

  // Calculate wait time
  const waitTime = await predictWaitTime({
    queueId: queue._id.toString(),
    currentLength: queue.currentLength,
    serviceRate: queue.serviceRate,
  });

  notifyQueueSubscribers(queue._id.toString(), queue.currentLength, waitTime).catch((err) =>
    console.error("[queue] socket notify failed:", err.message)
  );

  return {
    queue,
    waitTime,
  };
};

/**
 * Get queue status — name, currentLength, serviceRate, waitTime.
 */
const getQueueStatus = async (queueId) => {
  const queue = await Queue.findById(queueId);

  if (!queue) {
    const error = new Error("Queue not found");
    error.statusCode = 404;
    throw error;
  }

  const waitTime = await predictWaitTime({
    queueId: queue._id.toString(),
    currentLength: queue.currentLength,
    serviceRate: queue.serviceRate,
  });

  return {
    name: queue.name,
    currentLength: queue.currentLength,
    serviceRate: queue.serviceRate,
    waitTime,
  };
};

module.exports = {
  listQueues,
  createQueue,
  joinQueue,
  leaveQueue,
  getQueueStatus,
};
