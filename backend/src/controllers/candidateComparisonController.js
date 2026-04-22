import Candidate from "../models/Candidate.js";

// Compare multiple candidates
export const compareCandidates = async (req, res) => {
  try {
    const { candidateIds } = req.body;

    if (!candidateIds || candidateIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least 2 candidate IDs for comparison",
      });
    }

    const candidates = await Candidate.find({
      _id: { $in: candidateIds },
    });

    if (candidates.length < 2) {
      return res.status(404).json({
        success: false,
        message: "Could not find all requested candidates",
      });
    }

    // Calculate comparison metrics
    const comparisonData = candidates.map((candidate) => ({
      id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      position: candidate.position,
      experience: candidate.experience,
      skills: candidate.skills,
      hiringScore: candidate.hiringScore,
      status: candidate.status,
      applicationDate: candidate.applicationDate,
      skillCount: candidate.skills?.length || 0,
      avgSkillProficiency: calculateAvgProficiency(candidate.skills),
      qualifications: {
        experienceYears: candidate.experience,
        certifications: candidate.skills?.filter((s) => s.proficiency === "Expert")
          .length,
        totalSkills: candidate.skills?.length,
      },
    }));

    // Create comparison summary
    const topCandidate =
      comparisonData.reduce((prev, current) =>
        current.hiringScore > prev.hiringScore ? current : prev
      ) || comparisonData[0];

    res.status(200).json({
      success: true,
      comparisonData,
      topCandidate,
      totalCandidates: comparisonData.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error comparing candidates",
      error: error.message,
    });
  }
};

// Get detailed comparison between two candidates
export const detailedComparison = async (req, res) => {
  try {
    const { candidateId1, candidateId2 } = req.body;

    const candidate1 = await Candidate.findById(candidateId1);
    const candidate2 = await Candidate.findById(candidateId2);

    if (!candidate1 || !candidate2) {
      return res.status(404).json({
        success: false,
        message: "One or both candidates not found",
      });
    }

    const comparison = {
      candidates: [
        {
          id: candidate1._id,
          name: candidate1.name,
          experience: candidate1.experience,
          skills: candidate1.skills,
          hiringScore: candidate1.hiringScore,
          status: candidate1.status,
          applicationDate: candidate1.applicationDate,
        },
        {
          id: candidate2._id,
          name: candidate2.name,
          experience: candidate2.experience,
          skills: candidate2.skills,
          hiringScore: candidate2.hiringScore,
          status: candidate2.status,
          applicationDate: candidate2.applicationDate,
        },
      ],
      // TODO: Add more detailed comparison metrics here
      similarities: findSimilarities(candidate1, candidate2),
      differences: findDifferences(candidate1, candidate2),
      recommendation: recommendBestCandidate(candidate1, candidate2),
    };

    res.status(200).json({
      success: true,
      comparison,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in detailed comparison",
      error: error.message,
    });
  }
};

// Helper functions
const calculateAvgProficiency = (skills) => {
  if (!skills || skills.length === 0) return 0;
  const proficiencyMap = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    Expert: 4,
  };
  const total = skills.reduce(
    (sum, skill) => sum + (proficiencyMap[skill.proficiency] || 0),
    0
  );
  return (total / skills.length).toFixed(2);
};

const findSimilarities = (candidate1, candidate2) => {
  const similarities = [];
  const skills1 = candidate1.skills?.map((s) => s.name.toLowerCase()) || [];
  const skills2 = candidate2.skills?.map((s) => s.name.toLowerCase()) || [];
  const commonSkills = skills1.filter((s) => skills2.includes(s));

  if (commonSkills.length > 0) {
    similarities.push({
      type: "Common Skills",
      skills: commonSkills,
    });
  }

  if (
    Math.abs(candidate1.experience - candidate2.experience) <= 2
  ) {
    similarities.push({
      type: "Similar Experience",
      years: `Both have around ${Math.round(
        (candidate1.experience + candidate2.experience) / 2
      )} years`,
    });
  }

  return similarities;
};

const findDifferences = (candidate1, candidate2) => {
  const differences = [];

  // Experience difference
  if (candidate1.experience !== candidate2.experience) {
    differences.push({
      attribute: "Experience",
      candidate1: `${candidate1.experience} years`,
      candidate2: `${candidate2.experience} years`,
    });
  }

  // Skill count difference
  const skillCount1 = candidate1.skills?.length || 0;
  const skillCount2 = candidate2.skills?.length || 0;
  if (skillCount1 !== skillCount2) {
    differences.push({
      attribute: "Number of Skills",
      candidate1: skillCount1,
      candidate2: skillCount2,
    });
  }

  // Hiring score difference
  differences.push({
    attribute: "Hiring Score",
    candidate1: candidate1.hiringScore,
    candidate2: candidate2.hiringScore,
    better: candidate1.hiringScore > candidate2.hiringScore ? "Candidate 1" : "Candidate 2",
  });

  return differences;
};

const recommendBestCandidate = (candidate1, candidate2) => {
  if (candidate1.hiringScore > candidate2.hiringScore) {
    return {
      recommended: candidate1.name,
      reason: `Higher hiring score (${candidate1.hiringScore} vs ${candidate2.hiringScore})`,
      confidence: Math.min(candidate1.hiringScore, 95),
    };
  } else if (candidate2.hiringScore > candidate1.hiringScore) {
    return {
      recommended: candidate2.name,
      reason: `Higher hiring score (${candidate2.hiringScore} vs ${candidate1.hiringScore})`,
      confidence: Math.min(candidate2.hiringScore, 95),
    };
  } else {
    return {
      recommended: "TIE",
      reason: "Both candidates have equal scores",
      confidence: 50,
    };
  }
};

// Filter and search candidates
export const searchCandidates = async (req, res) => {
  try {
    const { query, position, status, minScore } = req.query;

    let filter = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { skills: { $elemMatch: { name: { $regex: query, $options: "i" } } } },
      ];
    }

    if (position) filter.position = position;
    if (status) filter.status = status;
    if (minScore) filter.hiringScore = { $gte: parseInt(minScore) };

    const candidates = await Candidate.find(filter).limit(50);

    res.status(200).json({
      success: true,
      candidates,
      count: candidates.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching candidates",
      error: error.message,
    });
  }
};
