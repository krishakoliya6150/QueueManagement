const mongoose = require("mongoose");

const queueLogSchema = new mongoose.Schema(
  {
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
    },
    action: {
      type: String,
      enum: ["JOIN", "LEAVE"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    queueLength: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Index for analytics queries
queueLogSchema.index({ queueId: 1, timestamp: 1 });

module.exports = mongoose.model("QueueLog", queueLogSchema);
