import React, { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const CompareCandidates = () => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Select candidate for comparison
  const toggleCandidateSelection = (candidateId) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(
        selectedCandidates.filter((id) => id !== candidateId)
      );
    } else {
      if (selectedCandidates.length < 5) {
        setSelectedCandidates([...selectedCandidates, candidateId]);
      } else {
        toast.error("You can compare up to 5 candidates at a time");
      }
    }
  };

  // Compare selected candidates
  const handleCompare = async () => {
    if (selectedCandidates.length < 2) {
      toast.error("Please select at least 2 candidates to compare");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/candidates/compare/compare`,
        { candidateIds: selectedCandidates }
      );

      if (response.data.success) {
        setComparisonResult(response.data);
        toast.success("Comparison completed successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error comparing candidates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Compare Candidates
          </h1>
          <p className="text-gray-600">
            Select and compare multiple candidates side-by-side
          </p>
        </div>

        {/* Search Section */}
        <div className="card bg-white shadow-lg mb-8">
          <div className="card-body">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name, email, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered flex-1"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <Search size={18} />
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Candidates List */}
          <div className="md:col-span-1">
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">Available Candidates</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {candidates.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Search for candidates to get started
                    </p>
                  ) : (
                    candidates.map((candidate) => (
                      <div
                        key={candidate._id}
                        className="p-3 border border-base-300 rounded-lg hover:bg-base-100 cursor-pointer transition"
                        onClick={() =>
                          toggleCandidateSelection(candidate._id)
                        }
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(
                              candidate._id
                            )}
                            onChange={(e) => e.stopPropagation()}
                            className="checkbox checkbox-primary mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{candidate.name}</p>
                            <p className="text-sm text-gray-600">
                              {candidate.position}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="badge badge-primary">
                                Score: {candidate.hiringScore}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {selectedCandidates.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">
                      Selected: {selectedCandidates.length}
                    </p>
                    <button
                      onClick={handleCompare}
                      disabled={loading || selectedCandidates.length < 2}
                      className="btn btn-success w-full"
                    >
                      {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        "Compare Selected"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comparison Results */}
          <div className="md:col-span-2">
            {comparisonResult ? (
              <div className="space-y-6">
                {/* Top Recommendation */}
                <div className="card bg-gradient-to-r from-success to-success/70 shadow-lg text-white">
                  <div className="card-body">
                    <h3 className="card-title text-lg">
                      Top Candidate Match
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold">
                          {comparisonResult.topCandidate?.name}
                        </p>
                        <p className="text-sm opacity-90">
                          {comparisonResult.topCandidate?.position}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold">
                          {comparisonResult.topCandidate?.hiringScore}%
                        </p>
                        <p className="text-sm opacity-90">Hiring Score</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidates Comparison Table */}
                <div className="card bg-white shadow-lg">
                  <div className="card-body">
                    <h3 className="card-title mb-4">Comparison Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="table table-zebra w-full text-sm">
                        <thead>
                          <tr className="bg-primary text-white">
                            <th>Candidate</th>
                            <th>Position</th>
                            <th>Experience</th>
                            <th>Skills</th>
                            <th>Score</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonResult.comparisonData?.map(
                            (candidate) => (
                              <tr key={candidate.id}>
                                <td className="font-semibold">
                                  {candidate.name}
                                </td>
                                <td>{candidate.position}</td>
                                <td>{candidate.experience} yrs</td>
                                <td>{candidate.skillCount}</td>
                                <td>
                                  <div className="badge badge-primary">
                                    {candidate.hiringScore}%
                                  </div>
                                </td>
                                <td>
                                  <div className="badge badge-secondary">
                                    {candidate.status}
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="grid md:grid-cols-2 gap-4">
                  {comparisonResult.comparisonData?.map((candidate) => (
                    <div key={candidate.id} className="card bg-white shadow">
                      <div className="card-body">
                        <h4 className="card-title text-lg">
                          {candidate.name}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Experience:</span>
                            <span className="font-semibold">
                              {candidate.experience} years
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Skills:</span>
                            <span className="font-semibold">
                              {candidate.skillCount} total
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Proficiency:</span>
                            <span className="font-semibold">
                              {candidate.avgSkillProficiency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Hiring Score:</span>
                            <div className="flex items-center gap-2">
                              <progress
                                className="progress progress-primary w-24"
                                value={candidate.hiringScore}
                                max="100"
                              ></progress>
                              <span className="font-semibold">
                                {candidate.hiringScore}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card bg-white shadow-lg h-full flex items-center justify-center">
                <div className="card-body text-center">
                  <ChevronRight size={48} className="mx-auto text-gray-400" />
                  <p className="text-gray-600">
                    Select at least 2 candidates to view comparison
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareCandidates;

