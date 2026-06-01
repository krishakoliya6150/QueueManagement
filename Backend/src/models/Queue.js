const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Queue name is required"],
      trim: true,
    },
    currentLength: {
      type: Number,
      default: 0,
      min: 0,
    },
    serviceRate: {
      type: Number,
      required: [true, "Service rate is required"],
      min: 0.01, // people per minute
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Queue", queueSchema);
