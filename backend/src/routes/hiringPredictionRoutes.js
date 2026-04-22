import express from "express";
import {
  predictHiringSuccess,
  getCandidatePredictions,
  bulkPredictions,
  updatePredictionOutcome,
  getModelPerformance,
} from "../controllers/hiringPredictionController.js";

const router = express.Router();

// Predict hiring success for a candidate
router.post("/predict", predictHiringSuccess);

// Get predictions for a candidate
router.get("/candidate/:candidateId", getCandidatePredictions);

// Bulk predictions for multiple candidates
router.post("/bulk-predict", bulkPredictions);

// Update prediction with actual outcome
router.put("/:predictionId/outcome", updatePredictionOutcome);

// Get model performance statistics
router.get("/stats/performance", getModelPerformance);

export default router;
