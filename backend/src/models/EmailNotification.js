import mongoose from "mongoose";

const emailNotificationSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
    },
    recipientName: String,
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate", // TODO: Connect to central MongoDB later
    },
    notificationType: {
      type: String,
      enum: ["Interview", "Rejection", "Offer", "Hired", "Update"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    plainTextContent: String,
    status: {
      type: String,
      enum: ["Pending", "Sent", "Failed", "Bounced"],
      default: "Pending",
    },
    sentAt: Date,
    failureReason: String,
    metadata: {
      position: String,
      interviewDate: Date,
      interviewTime: String,
      interviewer: String,
      offerDetails: String,
      rejectionReason: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true }
);

const EmailNotification = mongoose.model(
  "EmailNotification",
  emailNotificationSchema
);

export default EmailNotification;
