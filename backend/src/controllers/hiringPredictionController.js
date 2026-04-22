import HiringPrediction from "../models/HiringPrediction.js";
import Candidate from "../models/Candidate.js";

// Predict hiring success probability for a candidate
export const predictHiringSuccess = async (req, res) => {
  try {
    const { candidateId, recruiterId } = req.body;

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Calculate prediction based on various factors
    const prediction = calculatePrediction(candidate);

    // Save prediction to database
    const hiringPrediction = new HiringPrediction({
      candidateId,
      recruiterId,
      predictedOutcome: prediction.outcome,
      successProbability: prediction.probability,
      factors: prediction.factors,
      explanation: prediction.explanation,
    });

    await hiringPrediction.save();

    // Update candidate with hiring score
    candidate.hiringScore = prediction.probability;
    await candidate.save();

    res.status(201).json({
      success: true,
      message: "Prediction generated successfully",
      prediction: {
        candidateId,
        predictedOutcome: prediction.outcome,
        successProbability: prediction.probability,
        factors: prediction.factors,
        explanation: prediction.explanation,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating prediction",
      error: error.message,
    });
  }
};

// Get predictions for a candidate
export const getCandidatePredictions = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const predictions = await HiringPrediction.find({
      candidateId,
    }).sort({ createdAt: -1 });

    if (predictions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No predictions found for this candidate",
      });
    }

    res.status(200).json({
      success: true,
      predictions,
      latestPrediction: predictions[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching predictions",
      error: error.message,
    });
  }
};

// Get bulk predictions for multiple candidates
export const bulkPredictions = async (req, res) => {
  try {
    const { candidateIds } = req.body;

    if (!candidateIds || candidateIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide candidate IDs",
      });
    }

    const predictions = [];

    for (const candidateId of candidateIds) {
      const candidate = await Candidate.findById(candidateId);

      if (candidate) {
        const prediction = calculatePrediction(candidate);
        predictions.push({
          candidateId,
          candidateName: candidate.name,
          ...prediction,
        });
      }
    }

    res.status(200).json({
      success: true,
      predictions,
      count: predictions.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating bulk predictions",
      error: error.message,
    });
  }
};

// Update prediction with actual outcome
export const updatePredictionOutcome = async (req, res) => {
  try {
    const { predictionId } = req.params;
    const { actualOutcome } = req.body;

    const prediction = await HiringPrediction.findById(predictionId);

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: "Prediction not found",
      });
    }

    prediction.actualOutcome = actualOutcome;

    // Calculate accuracy if prediction was made
    if (
      actualOutcome === "Hired" &&
      (prediction.predictedOutcome === "High" ||
        prediction.predictedOutcome === "Medium")
    ) {
      prediction.accuracy = 100;
    } else if (
      actualOutcome === "Rejected" &&
      prediction.predictedOutcome === "Low"
    ) {
      prediction.accuracy = 100;
    } else {
      prediction.accuracy = 50;
    }

    await prediction.save();

    res.status(200).json({
      success: true,
      message: "Prediction outcome updated",
      prediction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating prediction",
      error: error.message,
    });
  }
};

// Get model performance statistics
export const getModelPerformance = async (req, res) => {
  try {
    const predictions = await HiringPrediction.find({
      actualOutcome: { $ne: "Pending" },
    });

    if (predictions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No completed predictions yet",
        stats: {
          totalPredictions: 0,
          accuracy: 0,
          precision: 0,
          recall: 0,
        },
      });
    }

    const correctPredictions = predictions.filter(
      (p) => p.accuracy === 100
    ).length;
    const accuracy = (
      (correctPredictions / predictions.length) *
      100
    ).toFixed(2);

    // Calculate precision and recall
    const truePositives = predictions.filter(
      (p) =>
        p.actualOutcome === "Hired" &&
        (p.predictedOutcome === "High" || p.predictedOutcome === "Medium")
    ).length;

    const falsePositives = predictions.filter(
      (p) =>
        p.actualOutcome === "Rejected" &&
        (p.predictedOutcome === "High" || p.predictedOutcome === "Medium")
    ).length;

    const falseNegatives = predictions.filter(
      (p) =>
        p.actualOutcome === "Hired" && p.predictedOutcome === "Low"
    ).length;

    const precision = (
      (truePositives / (truePositives + falsePositives)) *
      100
    ).toFixed(2);
    const recall = (
      (truePositives / (truePositives + falseNegatives)) *
      100
    ).toFixed(2);

    res.status(200).json({
      success: true,
      stats: {
        totalPredictions: predictions.length,
        correctPredictions,
        accuracy: parseFloat(accuracy),
        precision: isNaN(precision) ? 0 : parseFloat(precision),
        recall: isNaN(recall) ? 0 : parseFloat(recall),
        modelVersion: "1.0",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching model performance",
      error: error.message,
    });
  }
};

// Helper function to calculate prediction
const calculatePrediction = (candidate) => {
  // Initialize scores
  const factors = {
    skillMatch: {
      score: calculateSkillMatchScore(candidate.skills),
      weight: 0.3,
    },
    experience: {
      score: calculateExperienceScore(candidate.experience),
      weight: 0.2,
    },
    cultureFit: {
      score: Math.random() * 100, // TODO: Replace with actual culture fit model
      weight: 0.2,
    },
    communicationSkills: {
      score: Math.random() * 100, // TODO: Extract from resume/interview
      weight: 0.15,
    },
    previousRoleRelevance: {
      score: Math.random() * 100, // TODO: Analyze resume content
      weight: 0.15,
    },
  };

  // Calculate weighted probability
  let totalProbability = 0;
  let totalWeight = 0;

  Object.keys(factors).forEach((key) => {
    const factor = factors[key];
    totalProbability += factor.score * factor.weight;
    totalWeight += factor.weight;
  });

  const successProbability = Math.round(totalProbability / totalWeight);

  // Determine outcome
  let outcome = "Medium";
  if (successProbability >= 75) outcome = "High";
  else if (successProbability <= 40) outcome = "Low";

  // Generate explanation
  const explanation = generateExplanation(candidate, factors, successProbability);

  return {
    outcome,
    probability: successProbability,
    factors,
    explanation,
  };
};

const calculateSkillMatchScore = (skills) => {
  if (!skills || skills.length === 0) return 0;

  const expertCount = skills.filter((s) => s.proficiency === "Expert").length;
  const advancedCount = skills.filter((s) => s.proficiency === "Advanced").length;

  const score =
    (expertCount * 25 + advancedCount * 15 + skills.length * 5) /
    (skills.length * 1.5);

  return Math.min(Math.round(score), 100);
};

const calculateExperienceScore = (experience) => {
  if (!experience) return 0;

  // Optimal experience is 3-7 years for most roles
  if (experience >= 3 && experience <= 7) return 100;
  else if (experience >= 1 && experience <= 10) return 80;
  else if (experience > 10) return 70;
  else return 40;
};

const generateExplanation = (candidate, factors, probability) => {
  let explanation = `Based on our AI analysis, ${candidate.name} has a ${probability}% probability of being a successful hire. `;

  const skillScore = factors.skillMatch.score;
  if (skillScore >= 80)
    explanation += `Excellent skill match (${skillScore}%). `;
  else if (skillScore >= 60)
    explanation += `Good skill match (${skillScore}%). `;
  else explanation += `Moderate skill match (${skillScore}%). `;

  const expScore = factors.experience.score;
  if (expScore === 100)
    explanation += `Experience level is optimal for this role. `;
  else if (expScore >= 80)
    explanation += `Experience level is good. `;

  if (probability >= 75)
    explanation += `Highly recommended for interview.`;
  else if (probability >= 50)
    explanation += `Recommended for further evaluation.`;
  else explanation += `Consider alternative candidates.`;

  return explanation;
};
