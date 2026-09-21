// src/data/mockDashboard.js

export const mockDashboardData = {
  user: {
    name: "Parth",
    role: "Student",
  },

  readiness: {
    score: 74,
    change: 6,
    status: "Looking good",
  },

  stats: {
    profileCompletion: 68,
    matchedJobs: 12,
    verifiedSkills: 9,
    totalSkills: 14,
    activeApplications: 3,
  },

  skillGaps: [
    {
      name: "System Design",
      current: 30,
      required: 91,
    },
    {
      name: "Docker",
      current: 15,
      required: 78,
    },
    {
      name: "TypeScript",
      current: 55,
      required: 85,
    },
    {
      name: "SQL",
      current: 60,
      required: 82,
    },
  ],

  matchedJobs: [
    {
      company: "Z",
      companyName: "Zepto",
      role: "SDE Intern",
      location: "Mumbai",
      match: 87,
    },
    {
      company: "R",
      companyName: "Razorpay",
      role: "Backend Intern",
      location: "Bengaluru",
      match: 79,
    },
    {
      company: "S",
      companyName: "Swiggy",
      role: "Full Stack Intern",
      location: "Bengaluru",
      match: 72,
    },
  ],

  nextStep: {
    title: "Strengthen your System Design skills",
    description:
      "You're currently at 30%, while similar roles typically expect around 91%. Improving this skill could increase your job matches.",
    action: "Start learning",
  },
};