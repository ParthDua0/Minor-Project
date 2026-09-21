// src/data/mockLearnAndPractice.js

export const mockLearnAndPracticeData = {
  user: {
    name: "Parth",
    role: "student",
  },

  stats: {
    problemsSolved: 136,
    dayStreak: 14,
    tracksInProgress: 4,
    nearlyComplete: 1,
  },

  tabs: [
    {
      id: "tracks",
      label: "Learning Tracks",
    },
    {
      id: "practice",
      label: "Practice Problems",
    },
    {
      id: "resources",
      label: "Resources",
    },
  ],

  learningTracks: [
    {
      id: "dsa",
      name: "Data Structures & Algorithms",
      completed: 46,
      total: 120,
      progress: 38,
      color: "indigo",
      status: "in-progress",

      topics: [
        {
          id: "arrays-strings",
          name: "Arrays & Strings",
          completed: 18,
          total: 18,
          progress: 100,
          status: "completed",
        },
        {
          id: "linked-lists",
          name: "Linked Lists",
          completed: 12,
          total: 14,
          progress: 86,
          status: "in-progress",
        },
        {
          id: "stacks-queues",
          name: "Stacks & Queues",
          completed: 8,
          total: 12,
          progress: 67,
          status: "in-progress",
        },
        {
          id: "trees-graphs",
          name: "Trees & Graphs",
          completed: 8,
          total: 24,
          progress: 33,
          status: "in-progress",
        },
        {
          id: "dynamic-programming",
          name: "Dynamic Programming",
          completed: 0,
          total: 22,
          progress: 0,
          status: "not-started",
        },
        {
          id: "greedy-backtracking",
          name: "Greedy & Backtracking",
          completed: 0,
          total: 16,
          progress: 0,
          status: "locked",
        },
      ],
    },

    {
      id: "full-stack",
      name: "Full Stack Web Dev",
      completed: 50,
      total: 80,
      progress: 62,
      color: "teal",
      status: "in-progress",

      topics: [
        {
          id: "html-css",
          name: "HTML & CSS",
          completed: 12,
          total: 12,
          progress: 100,
          status: "completed",
        },
        {
          id: "javascript",
          name: "JavaScript",
          completed: 16,
          total: 20,
          progress: 80,
          status: "in-progress",
        },
        {
          id: "react",
          name: "React",
          completed: 14,
          total: 20,
          progress: 70,
          status: "in-progress",
        },
        {
          id: "backend",
          name: "Backend & APIs",
          completed: 8,
          total: 16,
          progress: 50,
          status: "in-progress",
        },
        {
          id: "deployment",
          name: "Deployment",
          completed: 0,
          total: 12,
          progress: 0,
          status: "not-started",
        },
      ],
    },

    {
      id: "system-design",
      name: "System Design",
      completed: 5,
      total: 40,
      progress: 12,
      color: "orange",
      status: "in-progress",

      topics: [
        {
          id: "fundamentals",
          name: "System Design Fundamentals",
          completed: 5,
          total: 12,
          progress: 42,
          status: "in-progress",
        },
        {
          id: "scalability",
          name: "Scalability",
          completed: 0,
          total: 10,
          progress: 0,
          status: "not-started",
        },
        {
          id: "databases",
          name: "Databases",
          completed: 0,
          total: 8,
          progress: 0,
          status: "not-started",
        },
        {
          id: "distributed-systems",
          name: "Distributed Systems",
          completed: 0,
          total: 10,
          progress: 0,
          status: "locked",
        },
      ],
    },

    {
      id: "aptitude",
      name: "Aptitude & Reasoning",
      completed: 35,
      total: 50,
      progress: 70,
      color: "pink",
      status: "nearly-complete",

      topics: [
        {
          id: "quantitative",
          name: "Quantitative Aptitude",
          completed: 15,
          total: 20,
          progress: 75,
          status: "in-progress",
        },
        {
          id: "logical",
          name: "Logical Reasoning",
          completed: 12,
          total: 15,
          progress: 80,
          status: "in-progress",
        },
        {
          id: "verbal",
          name: "Verbal Ability",
          completed: 8,
          total: 10,
          progress: 80,
          status: "in-progress",
        },
        {
          id: "data-interpretation",
          name: "Data Interpretation",
          completed: 0,
          total: 5,
          progress: 0,
          status: "not-started",
        },
      ],
    },
  ],

  practiceProblems: [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      topic: "Arrays",
      platform: "LeetCode",
      completed: true,
    },
    {
      id: 2,
      title: "Valid Parentheses",
      difficulty: "Easy",
      topic: "Stacks",
      platform: "LeetCode",
      completed: true,
    },
    {
      id: 3,
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      topic: "Strings",
      platform: "LeetCode",
      completed: false,
    },
    {
      id: 4,
      title: "Binary Tree Level Order Traversal",
      difficulty: "Medium",
      topic: "Trees",
      platform: "LeetCode",
      completed: false,
    },
  ],

  resources: [
    {
      id: 1,
      title: "DSA Interview Roadmap",
      type: "Roadmap",
      category: "Data Structures & Algorithms",
      description:
        "Structured roadmap covering the most important DSA topics for placement preparation.",
    },
    {
      id: 2,
      title: "System Design Fundamentals",
      type: "Guide",
      category: "System Design",
      description:
        "Core concepts to start preparing for system design interviews.",
    },
    {
      id: 3,
      title: "SQL Interview Practice",
      type: "Practice Set",
      category: "Database",
      description:
        "Frequently asked SQL patterns and interview-style problems.",
    },
  ],

  selectedTrackId: "dsa",

  nextStep: {
    title: "Finish Linked Lists",
    description:
      "You're already 12 of 14 problems through Linked Lists. Complete the remaining 2 problems to keep your DSA track moving.",
    action: "Continue",
  },
};