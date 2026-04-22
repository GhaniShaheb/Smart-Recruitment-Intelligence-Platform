import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

// Candidate Comparison APIs
export const searchCandidates = async (query) => {
  const response = await axios.get(`${API_BASE}/candidates/compare/search`, {
    params: { query },
  });
  return response.data;
};

export const compareCandidates = async (candidateIds) => {
  const response = await axios.post(`${API_BASE}/candidates/compare/compare`, {
    candidateIds,
  });
  return response.data;
};

export const detailedComparison = async (candidateId1, candidateId2) => {
  const response = await axios.post(
    `${API_BASE}/candidates/compare/detailed-comparison`,
    {
      candidateId1,
      candidateId2,
    }
  );
  return response.data;
};

// Recruiter Performance APIs
export const getAllRecruitersPerformance = async () => {
  const response = await axios.get(`${API_BASE}/recruiters`);
  return response.data;
};

export const getRecruiterPerformance = async (recruiterId) => {
  const response = await axios.get(`${API_BASE}/recruiters/${recruiterId}`);
  return response.data;
};

export const updateRecruiterMetrics = async (recruiterId) => {
  const response = await axios.put(
    `${API_BASE}/recruiters/${recruiterId}/update-metrics`
  );
  return response.data;
};

export const getMonthlyTrends = async (recruiterId) => {
  const response = await axios.get(
    `${API_BASE}/recruiters/${recruiterId}/monthly-trends`
  );
  return response.data;
};

// Hiring Prediction APIs
export const predictHiringSuccess = async (candidateId, recruiterId = null) => {
  const response = await axios.post(`${API_BASE}/predictions/predict`, {
    candidateId,
    recruiterId,
  });
  return response.data;
};

export const getCandidatePredictions = async (candidateId) => {
  const response = await axios.get(
    `${API_BASE}/predictions/candidate/${candidateId}`
  );
  return response.data;
};

export const bulkPredictions = async (candidateIds) => {
  const response = await axios.post(`${API_BASE}/predictions/bulk-predict`, {
    candidateIds,
  });
  return response.data;
};

export const updatePredictionOutcome = async (predictionId, actualOutcome) => {
  const response = await axios.put(
    `${API_BASE}/predictions/${predictionId}/outcome`,
    {
      actualOutcome,
    }
  );
  return response.data;
};

export const getModelPerformance = async () => {
  const response = await axios.get(`${API_BASE}/predictions/stats/performance`);
  return response.data;
};

// Email Notification APIs
export const sendInterviewNotification = async (notificationData) => {
  const response = await axios.post(
    `${API_BASE}/notifications/send-interview`,
    notificationData
  );
  return response.data;
};

export const sendRejectionNotification = async (notificationData) => {
  const response = await axios.post(
    `${API_BASE}/notifications/send-rejection`,
    notificationData
  );
  return response.data;
};

export const sendOfferNotification = async (notificationData) => {
  const response = await axios.post(
    `${API_BASE}/notifications/send-offer`,
    notificationData
  );
  return response.data;
};

export const getEmailNotifications = async (filters = {}) => {
  const response = await axios.get(`${API_BASE}/notifications`, {
    params: filters,
  });
  return response.data;
};

export const getCandidateNotifications = async (candidateId) => {
  const response = await axios.get(
    `${API_BASE}/notifications/candidate/${candidateId}`
  );
  return response.data;
};

export const retryFailedEmail = async (notificationId) => {
  const response = await axios.post(
    `${API_BASE}/notifications/${notificationId}/retry`
  );
  return response.data;
};
