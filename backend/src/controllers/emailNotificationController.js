import EmailNotification from "../models/EmailNotification.js";
import nodemailer from "nodemailer";

// TODO: Replace with your email service configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
});

// Send interview notification email
export const sendInterviewNotification = async (req, res) => {
  try {
    const { candidateEmail, candidateName, position, interviewDate, interviewTime, interviewer } = req.body;

    const htmlContent = generateInterviewEmailHTML(
      candidateName,
      position,
      interviewDate,
      interviewTime,
      interviewer
    );

    const emailNotification = new EmailNotification({
      recipientEmail: candidateEmail,
      recipientName: candidateName,
      notificationType: "Interview",
      subject: `Interview Scheduled - ${position} Position`,
      htmlContent,
      plainTextContent: `Dear ${candidateName}, Your interview for the ${position} position is scheduled for ${interviewDate} at ${interviewTime}. Interviewer: ${interviewer}`,
      metadata: {
        position,
        interviewDate,
        interviewTime,
        interviewer,
      },
    });

    await emailNotification.save();

    // TODO: Uncomment when email service is properly configured
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: candidateEmail,
    //   subject: emailNotification.subject,
    //   html: htmlContent,
    // });

    // emailNotification.status = "Sent";
    // emailNotification.sentAt = new Date();
    // await emailNotification.save();

    res.status(201).json({
      success: true,
      message: "Interview notification created (email sending disabled - configure email service)",
      notification: emailNotification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending interview notification",
      error: error.message,
    });
  }
};

// Send rejection notification email
export const sendRejectionNotification = async (req, res) => {
  try {
    const { candidateEmail, candidateName, position, rejectionReason } =
      req.body;

    const htmlContent = generateRejectionEmailHTML(
      candidateName,
      position,
      rejectionReason
    );

    const emailNotification = new EmailNotification({
      recipientEmail: candidateEmail,
      recipientName: candidateName,
      notificationType: "Rejection",
      subject: `Application Status - ${position} Position`,
      htmlContent,
      plainTextContent: `Dear ${candidateName}, Thank you for applying for the ${position} position. ${rejectionReason}`,
      metadata: {
        position,
        rejectionReason,
      },
    });

    await emailNotification.save();

    // TODO: Uncomment when email service is properly configured
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: candidateEmail,
    //   subject: emailNotification.subject,
    //   html: htmlContent,
    // });

    // emailNotification.status = "Sent";
    // emailNotification.sentAt = new Date();
    // await emailNotification.save();

    res.status(201).json({
      success: true,
      message: "Rejection notification created (email sending disabled - configure email service)",
      notification: emailNotification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending rejection notification",
      error: error.message,
    });
  }
};

// Send job offer notification email
export const sendOfferNotification = async (req, res) => {
  try {
    const { candidateEmail, candidateName, position, salary, offerDetails } =
      req.body;

    const htmlContent = generateOfferEmailHTML(
      candidateName,
      position,
      salary,
      offerDetails
    );

    const emailNotification = new EmailNotification({
      recipientEmail: candidateEmail,
      recipientName: candidateName,
      notificationType: "Offer",
      subject: `Job Offer - ${position} Position`,
      htmlContent,
      plainTextContent: `Dear ${candidateName}, We are pleased to offer you the ${position} position with a salary of ${salary}. ${offerDetails}`,
      metadata: {
        position,
        offerDetails,
      },
    });

    await emailNotification.save();

    // TODO: Uncomment when email service is properly configured
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: candidateEmail,
    //   subject: emailNotification.subject,
    //   html: htmlContent,
    // });

    // emailNotification.status = "Sent";
    // emailNotification.sentAt = new Date();
    // await emailNotification.save();

    res.status(201).json({
      success: true,
      message: "Offer notification created (email sending disabled - configure email service)",
      notification: emailNotification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending offer notification",
      error: error.message,
    });
  }
};

// Get all email notifications
export const getEmailNotifications = async (req, res) => {
  try {
    const { status, type, limit = 50 } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (type) filter.notificationType = type;

    const notifications = await EmailNotification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching email notifications",
      error: error.message,
    });
  }
};

// Get notification history for a candidate
export const getCandidateNotifications = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const notifications = await EmailNotification.find({
      candidateId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching candidate notifications",
      error: error.message,
    });
  }
};

// Retry failed email
export const retryFailedEmail = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await EmailNotification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.retryCount >= notification.maxRetries) {
      return res.status(400).json({
        success: false,
        message: "Maximum retries exceeded",
      });
    }

    // TODO: Uncomment when email service is properly configured
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: notification.recipientEmail,
    //   subject: notification.subject,
    //   html: notification.htmlContent,
    // });

    notification.retryCount += 1;
    notification.status = "Sent";
    notification.sentAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Email retry sent successfully",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrying email",
      error: error.message,
    });
  }
};

// Email template generators
const generateInterviewEmailHTML = (candidateName, position, interviewDate, interviewTime, interviewer) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #2563eb; color: white; padding: 20px; }
            .content { padding: 20px; }
            .button { background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Interview Scheduled!</h1>
            </div>
            <div class="content">
                <p>Dear ${candidateName},</p>
                <p>Congratulations! We are pleased to invite you for an interview for the <strong>${position}</strong> position.</p>
                <p><strong>Interview Details:</strong></p>
                <ul>
                    <li>Date: ${interviewDate}</li>
                    <li>Time: ${interviewTime}</li>
                    <li>Interviewer: ${interviewer}</li>
                </ul>
                <p>Please confirm your attendance by replying to this email.</p>
                <p>Best regards,<br>The Recruitment Team</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const generateRejectionEmailHTML = (candidateName, position, rejectionReason) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #6b7280; color: white; padding: 20px; }
            .content { padding: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Application Status Update</h1>
            </div>
            <div class="content">
                <p>Dear ${candidateName},</p>
                <p>Thank you for applying for the <strong>${position}</strong> position.</p>
                <p>After careful review of your application, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely matched our current needs.</p>
                <p><strong>Reason:</strong> ${rejectionReason}</p>
                <p>We encourage you to apply for future opportunities that match your skills and interests.</p>
                <p>Best regards,<br>The Recruitment Team</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const generateOfferEmailHTML = (candidateName, position, salary, offerDetails) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #10b981; color: white; padding: 20px; }
            .content { padding: 20px; }
            .highlight { background-color: #f0fdf4; padding: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Congratulations - Job Offer!</h1>
            </div>
            <div class="content">
                <p>Dear ${candidateName},</p>
                <p>We are thrilled to extend a job offer for the <strong>${position}</strong> position!</p>
                <div class="highlight">
                    <p><strong>Offer Details:</strong></p>
                    <p>Position: ${position}</p>
                    <p>Salary: ${salary}</p>
                    <p>${offerDetails}</p>
                </div>
                <p>Please confirm your acceptance by replying to this email with your signature on the attached offer letter.</p>
                <p>Welcome to our team!</p>
                <p>Best regards,<br>The Recruitment Team</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
