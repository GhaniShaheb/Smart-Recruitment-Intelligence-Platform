import React, { useState } from "react";
import { Mail, Send } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import {
  sendInterviewNotification,
  sendRejectionNotification,
  sendOfferNotification,
} from "../api/apiClient.js";

const EmailNotifications = () => {
  const [activeTab, setActiveTab] = useState("interview");
  const [loading, setLoading] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);

  // Interview Email Form
  const [interviewForm, setInterviewForm] = useState({
    candidateEmail: "",
    candidateName: "",
    position: "",
    interviewDate: "",
    interviewTime: "",
    interviewer: "",
  });

  // Rejection Email Form
  const [rejectionForm, setRejectionForm] = useState({
    candidateEmail: "",
    candidateName: "",
    position: "",
    rejectionReason: "",
  });

  // Offer Email Form
  const [offerForm, setOfferForm] = useState({
    candidateEmail: "",
    candidateName: "",
    position: "",
    salary: "",
    offerDetails: "",
  });

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

  // Handle Interview Email
  const handleSendInterview = async (e) => {
    e.preventDefault();

    if (
      !interviewForm.candidateEmail ||
      !interviewForm.candidateName ||
      !interviewForm.position ||
      !interviewForm.interviewDate ||
      !interviewForm.interviewTime ||
      !interviewForm.interviewer
    ) {
      toast.error("Please fill in all interview fields");
      return;
    }

    setLoading(true);
    try {
      const response = await sendInterviewNotification(interviewForm);

      if (response.success) {
        toast.success(`Interview email sent to ${interviewForm.candidateName} successfully! ✅`);
        setSentEmails([
          {
            type: "Interview",
            recipient: interviewForm.candidateEmail,
            timestamp: new Date(),
          },
          ...sentEmails,
        ]);
        setInterviewForm({
          candidateEmail: "",
          candidateName: "",
          position: "",
          interviewDate: "",
          interviewTime: "",
          interviewer: "",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send interview email ❌"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Rejection Email
  const handleSendRejection = async (e) => {
    e.preventDefault();

    if (
      !rejectionForm.candidateEmail ||
      !rejectionForm.candidateName ||
      !rejectionForm.position ||
      !rejectionForm.rejectionReason
    ) {
      toast.error("Please fill in all rejection fields");
      return;
    }

    setLoading(true);
    try {
      const response = await sendRejectionNotification(rejectionForm);

      if (response.success) {
        toast.success(`Rejection email sent to ${rejectionForm.candidateName} successfully! ✅`);
        setSentEmails([
          {
            type: "Rejection",
            recipient: rejectionForm.candidateEmail,
            timestamp: new Date(),
          },
          ...sentEmails,
        ]);
        setRejectionForm({
          candidateEmail: "",
          candidateName: "",
          position: "",
          rejectionReason: "",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send rejection email ❌"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Offer Email
  const handleSendOffer = async (e) => {
    e.preventDefault();

    if (
      !offerForm.candidateEmail ||
      !offerForm.candidateName ||
      !offerForm.position ||
      !offerForm.salary ||
      !offerForm.offerDetails
    ) {
      toast.error("Please fill in all offer fields");
      return;
    }

    setLoading(true);
    try {
      const response = await sendOfferNotification(offerForm);

      if (response.success) {
        toast.success(`Job offer email sent to ${offerForm.candidateName} successfully! ✅`);
        setSentEmails([
          {
            type: "Offer",
            recipient: offerForm.candidateEmail,
            timestamp: new Date(),
          },
          ...sentEmails,
        ]);
        setOfferForm({
          candidateEmail: "",
          candidateName: "",
          position: "",
          salary: "",
          offerDetails: "",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send offer email ❌"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mail size={32} className="text-primary" />
            <h1 className="text-4xl font-bold text-primary">
              Email Notifications
            </h1>
          </div>
          <p className="text-gray-600">
            Send interview, rejection, and job offer emails to candidates
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-bordered mb-8">
          <button
            className={`tab font-semibold ${
              activeTab === "interview" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("interview")}
          >
            📋 Interview Email
          </button>
          <button
            className={`tab font-semibold ${
              activeTab === "rejection" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("rejection")}
          >
            ❌ Rejection Email
          </button>
          <button
            className={`tab font-semibold ${
              activeTab === "offer" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("offer")}
          >
            ✅ Offer Email
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Email Form */}
          <div className="lg:col-span-2">
            {/* Interview Email Form */}
            {activeTab === "interview" && (
              <div className="card bg-white shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4">Interview Notification</h2>
                  <form onSubmit={handleSendInterview} className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Candidate Email *</span>
                      </label>
                      <input
                        type="email"
                        placeholder="candidate@example.com"
                        className="input input-bordered"
                        value={interviewForm.candidateEmail}
                        onChange={(e) =>
                          setInterviewForm({
                            ...interviewForm,
                            candidateEmail: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Candidate Name *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input input-bordered"
                        value={interviewForm.candidateName}
                        onChange={(e) =>
                          setInterviewForm({
                            ...interviewForm,
                            candidateName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Position *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Software Engineer"
                        className="input input-bordered"
                        value={interviewForm.position}
                        onChange={(e) =>
                          setInterviewForm({
                            ...interviewForm,
                            position: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Interview Date *</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered"
                        value={interviewForm.interviewDate}
                        onChange={(e) =>
                          setInterviewForm({
                            ...interviewForm,
                            interviewDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Interview Time *</span>
                      </label>
                      <input
                        type="time"
                        className="input input-bordered"
                        value={interviewForm.interviewTime}
                        onChange={(e) =>
                          setInterviewForm({
                            ...interviewForm,
                            interviewTime: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Interviewer Name *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Jane Smith"
                        className="input input-bordered"
                        value={interviewForm.interviewer}
                        onChange={(e) =>
                          setInterviewForm({
                            ...interviewForm,
                            interviewer: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <>
                          <Send size={18} />
                          Send Interview Email
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Rejection Email Form */}
            {activeTab === "rejection" && (
              <div className="card bg-white shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4">Rejection Notification</h2>
                  <form onSubmit={handleSendRejection} className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Candidate Email *</span>
                      </label>
                      <input
                        type="email"
                        placeholder="candidate@example.com"
                        className="input input-bordered"
                        value={rejectionForm.candidateEmail}
                        onChange={(e) =>
                          setRejectionForm({
                            ...rejectionForm,
                            candidateEmail: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Candidate Name *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input input-bordered"
                        value={rejectionForm.candidateName}
                        onChange={(e) =>
                          setRejectionForm({
                            ...rejectionForm,
                            candidateName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Position *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Software Engineer"
                        className="input input-bordered"
                        value={rejectionForm.position}
                        onChange={(e) =>
                          setRejectionForm({
                            ...rejectionForm,
                            position: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Rejection Reason *</span>
                      </label>
                      <textarea
                        placeholder="Reason for rejection..."
                        className="textarea textarea-bordered"
                        value={rejectionForm.rejectionReason}
                        onChange={(e) =>
                          setRejectionForm({
                            ...rejectionForm,
                            rejectionReason: e.target.value,
                          })
                        }
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-error w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <>
                          <Send size={18} />
                          Send Rejection Email
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Offer Email Form */}
            {activeTab === "offer" && (
              <div className="card bg-white shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4">Job Offer Notification</h2>
                  <form onSubmit={handleSendOffer} className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Candidate Email *</span>
                      </label>
                      <input
                        type="email"
                        placeholder="candidate@example.com"
                        className="input input-bordered"
                        value={offerForm.candidateEmail}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            candidateEmail: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Candidate Name *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input input-bordered"
                        value={offerForm.candidateName}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            candidateName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Position *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Software Engineer"
                        className="input input-bordered"
                        value={offerForm.position}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            position: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Salary *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="$80,000 per year"
                        className="input input-bordered"
                        value={offerForm.salary}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            salary: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Offer Details *</span>
                      </label>
                      <textarea
                        placeholder="Benefits, start date, terms, etc..."
                        className="textarea textarea-bordered"
                        value={offerForm.offerDetails}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            offerDetails: e.target.value,
                          })
                        }
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <>
                          <Send size={18} />
                          Send Offer Email
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Sent Emails History */}
          <div className="lg:col-span-1">
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">Sent Emails History</h3>
                {sentEmails.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No emails sent yet
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {sentEmails.map((email, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-base-100 rounded-lg border-l-4 border-primary"
                      >
                        <p className="font-semibold text-sm">{email.type}</p>
                        <p className="text-xs text-gray-600 truncate">
                          {email.recipient}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {email.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailNotifications;
