import React, { useState, useEffect } from "react";
import { TrendingUp, Award, Target, Clock } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const RecruiterPerformance = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

  useEffect(() => {
    fetchAllRecruiters();
  }, []);

  // Fetch all recruiters performance
  const fetchAllRecruiters = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/recruiters`);

      if (response.data.success) {
        setRecruiters(response.data.recruiters);
        if (response.data.recruiters.length > 0) {
          setSelectedRecruiter(response.data.recruiters[0]);
          fetchMonthlyTrends(response.data.recruiters[0].id);
        }
        toast.success("Recruiter data loaded");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching recruiters");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch monthly trends for selected recruiter
  const fetchMonthlyTrends = async (recruiterId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/recruiters/${recruiterId}/monthly-trends`
      );

      if (response.data.success) {
        setMonthlyTrends(response.data.trends);
      }
    } catch (error) {
      console.error("Error fetching trends:", error);
    }
  };

  const handleRecruiterSelect = (recruiter) => {
    setSelectedRecruiter(recruiter);
    fetchMonthlyTrends(recruiter.id);
  };

  // Metric Card Component
  const MetricCard = ({ icon: Icon, label, value, unit = "" }) => (
    <div className="card bg-white shadow">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-primary">
              {value}{unit}
            </p>
          </div>
          <Icon size={32} className="text-primary opacity-30" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Recruiter Performance Dashboard
          </h1>
          <p className="text-gray-600">
            Track and analyze recruiter efficiency metrics
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {/* Performance Cards */}
          {recruiters.map((recruiter) => (
            <div
              key={recruiter.id}
              onClick={() => handleRecruiterSelect(recruiter)}
              className={`card cursor-pointer transition transform hover:scale-105 ${
                selectedRecruiter?.id === recruiter.id
                  ? "bg-primary text-white shadow-xl"
                  : "bg-white shadow"
              }`}
            >
              <div className="card-body">
                <p className="text-sm opacity-80">Recruiter</p>
                <p className="font-bold">{recruiter.name}</p>
                <div className="divider my-2"></div>
                <div className="flex justify-between items-center text-xs">
                  <span>Efficiency:</span>
                  <span className="badge badge-lg">
                    {recruiter.efficiencyScore}%
                  </span>
                </div>
                <p className="text-xs opacity-70">
                  {recruiter.candidatesCount} candidates
                </p>
              </div>
            </div>
          ))}
        </div>

        {selectedRecruiter && (
          <>
            {/* Selected Recruiter Details */}
            <div className="card bg-white shadow-lg mb-8">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="card-title text-2xl">
                      {selectedRecruiter.name}
                    </h2>
                    <p className="text-gray-600">{selectedRecruiter.email}</p>
                    <p className="text-sm text-gray-500">
                      {selectedRecruiter.department} Department
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Efficiency Score</p>
                    <p className="text-5xl font-bold text-primary">
                      {selectedRecruiter.efficiencyScore}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <MetricCard
                icon={Award}
                label="Total Hired"
                value={selectedRecruiter.metrics.totalHired || 0}
              />
              <MetricCard
                icon={Target}
                label="Success Rate"
                value={selectedRecruiter.metrics.successRate?.toFixed(1) || 0}
                unit="%"
              />
              <MetricCard
                icon={Clock}
                label="Avg. Time to Hire"
                value={selectedRecruiter.metrics.averageTimeToHire || 0}
                unit=" days"
              />
              <MetricCard
                icon={TrendingUp}
                label="Quality of Hire"
                value={selectedRecruiter.metrics.qualityOfHire?.toFixed(0) || 0}
                unit="%"
              />
            </div>

            {/* Detailed Metrics */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Performance Metrics */}
              <div className="card bg-white shadow-lg">
                <div className="card-body">
                  <h3 className="card-title mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Success Rate</span>
                        <span className="text-sm font-bold">
                          {selectedRecruiter.metrics.successRate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <progress
                        className="progress progress-success w-full"
                        value={selectedRecruiter.metrics.successRate || 0}
                        max="100"
                      ></progress>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Quality of Hire</span>
                        <span className="text-sm font-bold">
                          {selectedRecruiter.metrics.qualityOfHire?.toFixed(0) || 0}%
                        </span>
                      </div>
                      <progress
                        className="progress progress-info w-full"
                        value={selectedRecruiter.metrics.qualityOfHire || 0}
                        max="100"
                      ></progress>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Offer Acceptance Rate</span>
                        <span className="text-sm font-bold">
                          {selectedRecruiter.metrics.offerAcceptanceRate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <progress
                        className="progress progress-warning w-full"
                        value={selectedRecruiter.metrics.offerAcceptanceRate || 0}
                        max="100"
                      ></progress>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Rejection Rate</span>
                        <span className="text-sm font-bold">
                          {selectedRecruiter.metrics.rejectionRate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <progress
                        className="progress progress-error w-full"
                        value={selectedRecruiter.metrics.rejectionRate || 0}
                        max="100"
                      ></progress>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Statistics */}
              <div className="card bg-white shadow-lg">
                <div className="card-body">
                  <h3 className="card-title mb-4">Key Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-base-100 rounded">
                      <span className="text-sm">Total Candidates Reviewed</span>
                      <span className="font-bold text-lg">
                        {selectedRecruiter.metrics.totalCandidatesReviewed || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-base-100 rounded">
                      <span className="text-sm">Total Hired</span>
                      <span className="font-bold text-lg text-success">
                        {selectedRecruiter.metrics.totalHired || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-base-100 rounded">
                      <span className="text-sm">Average Time to Hire</span>
                      <span className="font-bold text-lg">
                        {selectedRecruiter.metrics.averageTimeToHire || 0} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-base-100 rounded">
                      <span className="text-sm">Candidates Assigned</span>
                      <span className="font-bold text-lg">
                        {selectedRecruiter.candidatesCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            {monthlyTrends.length > 0 && (
              <div className="card bg-white shadow-lg">
                <div className="card-body">
                  <h3 className="card-title mb-4">Monthly Trends</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full text-sm">
                      <thead>
                        <tr className="bg-primary text-white">
                          <th>Month</th>
                          <th>Applications</th>
                          <th>Hired</th>
                          <th>Rejected</th>
                          <th>In Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyTrends.map((trend, idx) => (
                          <tr key={idx}>
                            <td className="font-semibold">{trend.month}</td>
                            <td>{trend.applicationsCount}</td>
                            <td className="text-success font-bold">
                              {trend.hiredCount}
                            </td>
                            <td className="text-error font-bold">
                              {trend.rejectedCount}
                            </td>
                            <td className="text-warning font-bold">
                              {trend.inProgressCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {recruiters.length === 0 && !loading && (
          <div className="card bg-white shadow-lg">
            <div className="card-body text-center py-12">
              <p className="text-gray-600 text-lg">
                No recruiters found. Please add recruiters to view performance data.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterPerformance;

