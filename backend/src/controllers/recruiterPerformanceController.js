import Recruiter from "../models/Recruiter.js";
import Candidate from "../models/Candidate.js";

// Get recruiter performance dashboard data
export const getRecruiterPerformance = async (req, res) => {
  try {
    const { recruiterId } = req.params;

    const recruiter = await Recruiter.findById(recruiterId).populate(
      "candidatesAssigned"
    );

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
      });
    }

    // Calculate current metrics
    const metrics = calculateMetrics(recruiter);

    res.status(200).json({
      success: true,
      recruiter: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        department: recruiter.department,
      },
      metrics,
      monthlyStats: recruiter.monthlyStats || [],
      efficiencyScore: recruiter.efficiencyScore,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching recruiter performance",
      error: error.message,
    });
  }
};

// Get all recruiters with their performance metrics
export const getAllRecruitersPerformance = async (req, res) => {
  try {
    const recruiters = await Recruiter.find().populate("candidatesAssigned");

    const recruiterPerformance = recruiters.map((recruiter) => ({
      id: recruiter._id,
      name: recruiter.name,
      email: recruiter.email,
      department: recruiter.department,
      metrics: recruiter.performanceMetrics,
      efficiencyScore: recruiter.efficiencyScore,
      candidatesCount: recruiter.candidatesAssigned?.length || 0,
    }));

    // Sort by efficiency score
    recruiterPerformance.sort(
      (a, b) => b.efficiencyScore - a.efficiencyScore
    );

    res.status(200).json({
      success: true,
      recruiters: recruiterPerformance,
      totalRecruiters: recruiterPerformance.length,
      averageEfficiency:
        recruiterPerformance.reduce((sum, r) => sum + r.efficiencyScore, 0) /
        recruiterPerformance.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching recruiters performance",
      error: error.message,
    });
  }
};

// Update recruiter performance metrics
export const updateRecruiterMetrics = async (req, res) => {
  try {
    const { recruiterId } = req.params;

    const recruiter = await Recruiter.findById(recruiterId);

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
      });
    }

    // Get all candidates assigned to this recruiter
    const candidates = await Candidate.find({
      assignedRecruiter: recruiterId,
    });

    // Calculate fresh metrics
    const hiredCandidates = candidates.filter(
      (c) => c.status === "Hired"
    ).length;
    const rejectedCandidates = candidates.filter(
      (c) => c.status === "Rejected"
    ).length;
    const totalReviewed = candidates.length;

    // Calculate average time to hire in days
    const hiredDates = candidates
      .filter((c) => c.hireDate && c.applicationDate)
      .map(
        (c) =>
          (new Date(c.hireDate) - new Date(c.applicationDate)) / (1000 * 60 * 60 * 24)
      );
    const avgTimeToHire =
      hiredDates.length > 0
        ? hiredDates.reduce((a, b) => a + b) / hiredDates.length
        : 0;

    // Calculate success rate
    const successRate =
      totalReviewed > 0 ? ((hiredCandidates / totalReviewed) * 100).toFixed(2) : 0;

    // Calculate rejection rate
    const rejectionRate =
      totalReviewed > 0
        ? ((rejectedCandidates / totalReviewed) * 100).toFixed(2)
        : 0;

    // Calculate offer acceptance rate
    const offeredCandidates = candidates.filter(
      (c) => c.status === "Offered" || c.status === "Hired"
    ).length;
    const offerAcceptanceRate =
      offeredCandidates > 0
        ? ((hiredCandidates / offeredCandidates) * 100).toFixed(2)
        : 0;

    // Calculate quality of hire (based on hiring score of hired candidates)
    const qualityOfHire =
      hiredCandidates > 0
        ? candidates
            .filter((c) => c.status === "Hired")
            .reduce((sum, c) => sum + c.hiringScore, 0) / hiredCandidates
        : 0;

    // Calculate efficiency score (0-100)
    const efficiencyScore = Math.round(
      (successRate * 0.4 +
        (100 - rejectionRate) * 0.3 +
        qualityOfHire * 0.3) /
        3
    );

    // Update recruiter record
    recruiter.performanceMetrics = {
      totalCandidatesReviewed: totalReviewed,
      totalHired: hiredCandidates,
      rejectionRate: parseFloat(rejectionRate),
      averageTimeToHire: Math.round(avgTimeToHire),
      qualityOfHire: Math.round(qualityOfHire),
      successRate: parseFloat(successRate),
      offerAcceptanceRate: parseFloat(offerAcceptanceRate),
    };

    recruiter.efficiencyScore = efficiencyScore;

    await recruiter.save();

    res.status(200).json({
      success: true,
      message: "Recruiter metrics updated successfully",
      metrics: recruiter.performanceMetrics,
      efficiencyScore: recruiter.efficiencyScore,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating recruiter metrics",
      error: error.message,
    });
  }
};

// Get monthly performance trends
export const getMonthlyTrends = async (req, res) => {
  try {
    const { recruiterId } = req.params;

    const recruiter = await Recruiter.findById(recruiterId);

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
      });
    }

    // Get candidates and group by month
    const candidates = await Candidate.find({
      assignedRecruiter: recruiterId,
    });

    const monthlyTrends = {};

    candidates.forEach((candidate) => {
      const monthKey = new Date(candidate.applicationDate).toISOString().slice(0, 7); // YYYY-MM

      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = {
          month: monthKey,
          applicationsCount: 0,
          hiredCount: 0,
          rejectedCount: 0,
          inProgressCount: 0,
        };
      }

      monthlyTrends[monthKey].applicationsCount++;

      if (candidate.status === "Hired") {
        monthlyTrends[monthKey].hiredCount++;
      } else if (candidate.status === "Rejected") {
        monthlyTrends[monthKey].rejectedCount++;
      } else {
        monthlyTrends[monthKey].inProgressCount++;
      }
    });

    const trends = Object.values(monthlyTrends).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    res.status(200).json({
      success: true,
      trends,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching monthly trends",
      error: error.message,
    });
  }
};

// Helper function to calculate metrics
const calculateMetrics = (recruiter) => {
  const metrics = recruiter.performanceMetrics;
  return {
    totalCandidatesReviewed: metrics.totalCandidatesReviewed || 0,
    totalHired: metrics.totalHired || 0,
    rejectionRate: parseFloat(metrics.rejectionRate) || 0,
    averageTimeToHire: metrics.averageTimeToHire || 0,
    qualityOfHire: parseFloat(metrics.qualityOfHire) || 0,
    successRate: parseFloat(metrics.successRate) || 0,
    offerAcceptanceRate: parseFloat(metrics.offerAcceptanceRate) || 0,
  };
};
