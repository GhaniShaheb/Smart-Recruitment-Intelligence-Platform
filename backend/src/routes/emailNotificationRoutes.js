import express from "express";
import {
  sendInterviewNotification,
  sendRejectionNotification,
  sendOfferNotification,
  getEmailNotifications,
  getCandidateNotifications,
  retryFailedEmail,
} from "../controllers/emailNotificationController.js";

const router = express.Router();

// Send interview notification
router.post("/send-interview", sendInterviewNotification);

// Send rejection notification
router.post("/send-rejection", sendRejectionNotification);

// Send job offer notification
router.post("/send-offer", sendOfferNotification);

// Get all email notifications
router.get("/", getEmailNotifications);

// Get notifications for specific candidate
router.get("/candidate/:candidateId", getCandidateNotifications);

// Retry failed email
router.post("/:notificationId/retry", retryFailedEmail);

export default router;
