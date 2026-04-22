import express from "express";
import {
  getRecruiterPerformance,
  getAllRecruitersPerformance,
  updateRecruiterMetrics,
  getMonthlyTrends,
} from "../controllers/recruiterPerformanceController.js";

const router = express.Router();

// Get specific recruiter performance
router.get("/:recruiterId", getRecruiterPerformance);

// Get all recruiters performance
router.get("/", getAllRecruitersPerformance);

// Update recruiter metrics
router.put("/:recruiterId/update-metrics", updateRecruiterMetrics);

// Get monthly trends for recruiter
router.get("/:recruiterId/monthly-trends", getMonthlyTrends);

export default router;
