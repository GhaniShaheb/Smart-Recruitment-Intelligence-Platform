import mongoose from "mongoose";

const hiringPredictionSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate", // TODO: Connect to central MongoDB later
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter", // TODO: Connect to central MongoDB later
    },
    // Prediction model inputs
    predictedOutcome: {
      type: String,
      enum: ["High", "Medium", "Low"],
      required: true,
    },
    successProbability: {
      type: Number,
      required: true, // 0-100
    },
    // Feature importance scores
    factors: {
      skillMatch: {
        score: Number,
        weight: Number,
      },
      experience: {
        score: Number,
        weight: Number,
      },
      cultureFit: {
        score: Number,
        weight: Number,
      },
      communicationSkills: {
        score: Number,
        weight: Number,
      },
      previousRoleRelevance: {
        score: Number,
        weight: Number,
      },
    },
    modelVersion: {
      type: String,
      default: "1.0", // Track model version for reproducibility
    },
    predictionDate: {
      type: Date,
      default: Date.now,
    },
    actualOutcome: {
      type: String,
      enum: ["Hired", "Rejected", "Pending"],
      default: "Pending",
    },
    accuracy: Number, // If actual outcome is known, calculate accuracy
    explanation: String, // Human-readable explanation of prediction
  },
  { timestamps: true }
);

const HiringPrediction = mongoose.model(
  "HiringPrediction",
  hiringPredictionSchema
);

export default HiringPrediction;
