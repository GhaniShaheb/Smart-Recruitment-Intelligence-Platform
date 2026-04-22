import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      default: "HR",
    },
    phone: String,
    hireDate: Date,
    candidatesAssigned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate", // TODO: Connect to central MongoDB later
      },
    ],
    // Performance Metrics
    performanceMetrics: {
      totalCandidatesReviewed: {
        type: Number,
        default: 0,
      },
      totalHired: {
        type: Number,
        default: 0,
      },
      rejectionRate: {
        type: Number,
        default: 0, // percentage
      },
      averageTimeToHire: {
        type: Number,
        default: 0, // in days
      },
      qualityOfHire: {
        type: Number,
        default: 0, // 0-100 score
      },
      successRate: {
        type: Number,
        default: 0, // percentage (hired / reviewed)
      },
      offerAcceptanceRate: {
        type: Number,
        default: 0, // percentage
      },
    },
    // Monthly tracking
    monthlyStats: [
      {
        month: Date,
        candidatesReviewed: Number,
        candidatesHired: Number,
        averageHiringTime: Number,
      },
    ],
    // Efficiency score (0-100)
    efficiencyScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Recruiter = mongoose.model("Recruiter", recruiterSchema);

export default Recruiter;
