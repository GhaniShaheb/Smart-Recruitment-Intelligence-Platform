import express from "express";
import {
  compareCandidates,
  detailedComparison,
  searchCandidates,
} from "../controllers/candidateComparisonController.js";

const router = express.Router();

// Compare multiple candidates
router.post("/compare", compareCandidates);

// Detailed comparison between two candidates
router.post("/detailed-comparison", detailedComparison);

// Search and filter candidates
router.get("/search", searchCandidates);

export default router;
