
import { getUserInfo } from "./apiAuth";
import { getJobs } from "./apiCareer";

export async function getDashboardData() {
  const response = await getUserInfo();

  let jobMatches = [];

  try {
    const jobData = await getJobs();
    jobMatches = Array.isArray(jobData?.jobs)
      ? jobData.jobs
      : [];
  } catch (error) {
    console.warn("Job matches are unavailable", error);
  }

  // Correct backend response structure:
  // response.user.profile
  const user = response?.user || {};
  const profile = user?.profile || {};

  const parsedSkills = Array.isArray(profile.parsedSkills)
    ? profile.parsedSkills
    : [];

  const education = Array.isArray(profile.education)
    ? profile.education
    : [];

  const experience = Array.isArray(profile.experience)
    ? profile.experience
    : [];

  const targetRoles = Array.isArray(profile.targetRoles)
    ? profile.targetRoles
    : [];

  const workPreference = Array.isArray(profile.workPreference)
    ? profile.workPreference
    : [];

  // Calculate profile completion using actual saved information.
  const profileFields = [
    Boolean(user.fullname?.trim()),
    Boolean(user.email?.trim()),
    Boolean(user.graduationYear),
    Boolean(profile.branch?.trim()),
    profile.cgpa !== undefined && profile.cgpa !== null,
    Boolean(profile.currentYear),
    Boolean(profile.resumeFileUrl),
    targetRoles.length > 0,
    Boolean(profile.customGoal?.trim()),
    parsedSkills.length > 0,
    education.some(
      (item) =>
        item.degree?.trim() ||
        item.branch?.trim() ||
        item.institute?.trim()
    ),
    experience.some(
      (item) =>
        item.title?.trim() ||
        item.org?.trim() ||
        item.description?.trim()
    ),
  ];

  const completedFields = profileFields.filter(Boolean).length;

  const profileCompletion = Math.round(
    (completedFields / profileFields.length) * 100
  );

  // Only use readiness if the backend actually provides it.
  const readinessData = user.readiness || null;

  const readiness =
    typeof readinessData?.score === "number"
      ? {
          score: readinessData.score,
          change:
            typeof readinessData.change === "number"
              ? readinessData.change
              : null,
          status: readinessData.status || null,
          description: readinessData.description || null,
        }
      : null;

  const matchedJobs = jobMatches.slice(0, 4).map((job) => ({
    role: job.title || "Untitled role",
    company: (job.company || "?").slice(0, 1).toUpperCase(),
    companyName: job.company || "Unknown company",
    location: job.location || "Location not specified",
    match: job.match?.score ?? 0,
  }));

  return {
    user: {
      name: user.fullname || "Student",
      email: user.email || "",
      role: user.role || "student",
      graduationYear: user.graduationYear || null,
      phone: user.phone || "",
    },

    profile: {
      branch: profile.branch || "",
      cgpa: profile.cgpa ?? null,
      currentYear: profile.currentYear ?? null,
      targetRoles,
      customGoal: profile.customGoal || "",
      employmentType: profile.employmentType || "",
      workPreference,
      resumeFileUrl: profile.resumeFileUrl || "",
      parsedSkills,
      education,
      experience,
      linkedin: profile.linkedin || "",
      github: profile.github || "",
      portfolio: profile.portfolio || "",
    },

    stats: {
      profileCompletion,
      verifiedSkills: null,
      totalSkills: parsedSkills.length,
      matchedJobs: jobMatches.filter(
        (job) => job.match?.isFit
      ).length,
      activeApplications: null,
    },

    readiness,

    skillGaps: [],

    matchedJobs,

    nextStep: {
      title:
        !profile.resumeFileUrl
          ? "Upload your resume"
          : parsedSkills.length === 0
            ? "Complete your skills"
            : experience.length === 0
              ? "Add your experience"
              : targetRoles.length === 0
                ? "Set your career goals"
                : "Explore your job matches",

      description:
        !profile.resumeFileUrl
          ? "Upload your resume to begin extracting your skills and experience."
          : parsedSkills.length === 0
            ? "Your resume has not provided any parsed skills yet."
            : experience.length === 0
              ? "Add projects, internships, or work experience to strengthen your profile."
              : targetRoles.length === 0
                ? "Choose your target roles to improve job matching."
                : "Explore opportunities matching your profile.",

      action: "View profile",
    },
  };
}
