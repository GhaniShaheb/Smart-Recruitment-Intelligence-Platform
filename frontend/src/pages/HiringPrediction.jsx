import React, { useState } from "react";
import { TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const HiringPrediction = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [modelStats, setModelStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

  // Search candidates
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/candidates/compare/search`,
        {
          params: { query: searchQuery },
        }
      );

      if (response.data.success) {
        setCandidates(response.data.candidates);
        toast.success(`Found ${response.data.count} candidates`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error searching candidates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Predict for single candidate
  const predictCandidate = async (candidateId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/predictions/predict`, {
        candidateId,
        recruiterId: null, // TODO: Set actual recruiter ID from auth
      });

      if (response.data.success) {
        setPredictions([response.data.prediction, ...predictions]);
        setSelectedCandidate(response.data.prediction);
        toast.success("Prediction generated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error generating prediction");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Bulk predict
  const bulkPredict = async () => {
    if (candidates.length === 0) {
      toast.error("Please search for candidates first");
      return;
    }

    setLoading(true);
    try {
      const candidateIds = candidates.map((c) => c._id);
      const response = await axios.post(
        `${API_BASE}/predictions/bulk-predict`,
        {
          candidateIds,
        }
      );

      if (response.data.success) {
        setPredictions(response.data.predictions);
        toast.success(`Generated ${response.data.count} predictions`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error in bulk prediction");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch model statistics
  const fetchModelStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/predictions/stats/performance`);

      if (response.data.success) {
        setModelStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching model stats:", error);
    }
  };

  // Prediction outcome badge
  const OutcomeBadge = ({ outcome }) => {
    switch (outcome) {
      case "High":
        return <div className="badge badge-success">High Probability</div>;
      case "Medium":
        return <div className="badge badge-warning">Medium Probability</div>;
      case "Low":
        return <div className="badge badge-error">Low Probability</div>;
      default:
        return <div className="badge">Unknown</div>;
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Hiring Success Prediction
          </h1>
          <p className="text-gray-600">
            AI-powered prediction model to forecast candidate hiring success
          </p>
        </div>

        {/* Model Performance Stats */}
        {modelStats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="card bg-white shadow">
              <div className="card-body">
                <p className="text-sm text-gray-600">Model Accuracy</p>
                <p className="text-3xl font-bold text-primary">
                  {modelStats.accuracy}%
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Based on {modelStats.totalPredictions} predictions
                </p>
              </div>
            </div>
            <div className="card bg-white shadow">
              <div className="card-body">
                <p className="text-sm text-gray-600">Precision</p>
                <p className="text-3xl font-bold text-info">
                  {modelStats.precision}%
                </p>
              </div>
            </div>
            <div className="card bg-white shadow">
              <div className="card-body">
                <p className="text-sm text-gray-600">Recall</p>
                <p className="text-3xl font-bold text-success">
                  {modelStats.recall}%
                </p>
              </div>
            </div>
            <div className="card bg-white shadow">
              <div className="card-body">
                <p className="text-sm text-gray-600">Model Version</p>
                <p className="text-2xl font-bold">{modelStats.modelVersion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Prediction Controls */}
        <div className="card bg-white shadow-lg mb-8">
          <div className="card-body">
            <h2 className="card-title mb-4">Search Candidates</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search by name, email, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered flex-1"
              />
              <button
                onClick={handleSearch}
                className="btn btn-primary"
                disabled={loading}
              >
                Search
              </button>
              {candidates.length > 0 && (
                <button
                  onClick={bulkPredict}
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    `Predict All (${candidates.length})`
                  )}
                </button>
              )}
              <button
                onClick={fetchModelStats}
                className="btn btn-outline"
                disabled={loading}
              >
                Refresh Stats
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Candidates List */}
          <div className="md:col-span-1">
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">Candidates</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {candidates.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Search for candidates to get started
                    </p>
                  ) : (
                    candidates.map((candidate) => (
                      <div
                        key={candidate._id}
                        className="p-3 border border-base-300 rounded-lg hover:bg-base-100 cursor-pointer transition"
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <p className="font-semibold text-sm">{candidate.name}</p>
                        <p className="text-xs text-gray-600">
                          {candidate.position}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            predictCandidate(candidate._id);
                          }}
                          className="btn btn-sm btn-primary mt-2 w-full"
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            "Predict"
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Prediction Details */}
          <div className="md:col-span-2">
            {selectedCandidate && selectedCandidate.candidateName ? (
              <div className="space-y-6">
                {/* Prediction Card */}
                <div className="card bg-gradient-to-r from-primary to-primary/70 text-white shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="card-title text-2xl">
                          {selectedCandidate.candidateName}
                        </h3>
                      </div>
                      <TrendingUp size={40} className="opacity-50" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 my-4">
                      <div>
                        <p className="text-sm opacity-75">Probability</p>
                        <p className="text-4xl font-bold">
                          {selectedCandidate.probability}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm opacity-75">Prediction</p>
                        <p className="text-2xl font-bold">
                          {selectedCandidate.outcome}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm opacity-75">Confidence</p>
                        <progress
                          className="progress progress-success w-full"
                          value={selectedCandidate.probability}
                          max="100"
                        ></progress>
                      </div>
                    </div>

                    <p className="text-sm opacity-90">
                      {selectedCandidate.explanation}
                    </p>
                  </div>
                </div>

                {/* Factor Analysis */}
                <div className="card bg-white shadow-lg">
                  <div className="card-body">
                    <h4 className="card-title mb-4">Factor Analysis</h4>
                    <div className="space-y-4">
                      {selectedCandidate.factors &&
                        Object.entries(selectedCandidate.factors).map(
                          ([key, factor]) => (
                            <div key={key}>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm font-semibold capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}
                                </span>
                                <span className="text-sm">
                                  {factor.score?.toFixed(0)}%
                                </span>
                              </div>
                              <progress
                                className="progress progress-primary w-full"
                                value={factor.score || 0}
                                max="100"
                              ></progress>
                              <p className="text-xs text-gray-500 mt-1">
                                Weight: {(factor.weight * 100).toFixed(0)}%
                              </p>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`card ${
                  selectedCandidate.outcome === "High"
                    ? "bg-success/10"
                    : selectedCandidate.outcome === "Medium"
                    ? "bg-warning/10"
                    : "bg-error/10"
                } shadow-lg`}>
                  <div className="card-body">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedCandidate.outcome === "High" ? (
                        <CheckCircle size={24} className="text-success" />
                      ) : (
                        <AlertCircle size={24} className="text-warning" />
                      )}
                      <h4 className="text-lg font-bold">Recommendation</h4>
                    </div>
                    <p className="text-sm">
                      {selectedCandidate.outcome === "High"
                        ? "This candidate has a high probability of success. Strongly recommended for interview."
                        : selectedCandidate.outcome === "Medium"
                        ? "This candidate shows moderate potential. Recommend for further evaluation."
                        : "This candidate has a low probability of success. Consider alternative candidates."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card bg-white shadow-lg h-full flex items-center justify-center">
                <div className="card-body text-center">
                  <p className="text-gray-600">
                    Select a candidate to view detailed predictions
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Predictions History */}
        {predictions.length > 0 && (
          <div className="card bg-white shadow-lg mt-8">
            <div className="card-body">
              <h3 className="card-title mb-4">Predictions History</h3>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-sm">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th>Candidate</th>
                      <th>Outcome</th>
                      <th>Probability</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((prediction, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold">
                          {prediction.candidateName}
                        </td>
                        <td>
                          <OutcomeBadge outcome={prediction.outcome} />
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <progress
                              className="progress progress-primary w-24"
                              value={prediction.probability}
                              max="100"
                            ></progress>
                            <span className="font-semibold">
                              {prediction.probability}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-outline">
                            {prediction.actualOutcome || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiringPrediction;
