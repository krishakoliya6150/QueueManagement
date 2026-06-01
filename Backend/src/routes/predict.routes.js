const express = require("express");
const router = express.Router();

const { getPrediction } = require("../controllers/predict.controller");

// GET /api/predict/:queueId
router.get("/:queueId", getPrediction);

module.exports = router;

