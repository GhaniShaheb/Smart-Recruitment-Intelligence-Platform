import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
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
    phone: {
      type: String,
    },
    position: {
      type: String,
      required: true,
    },
    skills: [
      {
        name: String,
        proficiency: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
        },
        matchScore: Number, // AI-based skill match score (0-100)
      },
    ],
    experience: {
      type: Number, // years of experience
    },
    resume: {
      url: String,
      fileName: String,
    },
    aiSummary: {
      type: String, // AI-generated candidate summary
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: [
        "Applied",
        "Shortlisted",
        "Interview",
        "Offered",
        "Hired",
        "Rejected",
      ],
      default: "Applied",
    },
    hiringScore: {
      type: Number, // Overall hiring probability (0-100)
      default: 0,
    },
    assignedRecruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter", // TODO: Connect to central MongoDB later
    },
    interviewDate: Date,
    offerDate: Date,
    hireDate: Date,
    skillGaps: [
      {
        skill: String,
        explanation: String,
      },
    ],
    notes: String,
  },
  { timestamps: true }
);

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;
