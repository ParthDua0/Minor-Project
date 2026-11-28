import { getUserInfo } from "./apiAuth";
import { getAssessments, getJobs, getReadiness } from "./apiCareer";

export async function getDashboardData() {
  const response = await getUserInfo();

  let jobMatches = [];
  try {
    const jobData = await getJobs();
    jobMatches = jobData.jobs || [];
  } catch (error) {
    console.warn("Job matches are unavailable", error);
  }

  let assessments = [];
  try {
    const assessmentData = await getAssessments();
    assessments = assessmentData.assessments || [];
  } catch (error) {
    console.warn("Assessments are unavailable", error);
  }

  let readinessData = { readiness: null, skillDetails: [], requiredSkills: [], passedSkills: [] };
  try {
    readinessData = await getReadiness();
  } catch (error) {
    console.warn("Readiness is unavailable", error);
  }

  const user = response?.user || {};
  const profile = response || {};

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

  // Map assessments by lowercase skill name
  const assessmentMap = new Map(
    assessments.map((a) => [a.skill.toLowerCase(), a])
  );

  // Only role-required skills belong in readiness; resume and manual skills do not.
  const skillGaps = (readinessData.skillDetails || [])
    .filter((detail) => !detail.passed)
    .map((detail) => ({
      name: detail.skill,
      current: detail.score || 0,
      required: 70,
      attempted: detail.assessed,
      level: assessmentMap.get(detail.skill)?.level || "Unverified",
    }))
    // Sort: attempted (< 70%) first by lowest score, then unattempted
    .sort((a, b) => {
      if (a.attempted !== b.attempted) return a.attempted ? -1 : 1;
      return a.current - b.current;
    });

  const verifiedCount = (readinessData.passedSkills || []).length;

  const profileFields = [
    user.fullname,
    user.email,
    user.graduationYear,
    profile.branch,
    profile.cgpa,
    profile.currentYear,
    profile.resume?.url,
    targetRoles.length > 0,
    profile.customGoal,
    parsedSkills.length > 0,
  ];

  const completedFields = profileFields.filter(Boolean).length;

  const profileCompletion =
    response?.profileCompletion ??
    Math.round((completedFields / profileFields.length) * 100);

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
      workPreference: profile.workPreference || [],
      resumeFileUrl: profile.resume?.url || "",
      parsedSkills,
      education,
      experience,
      linkedin: profile.linkedin || "",
      github: profile.github || "",
      portfolio: profile.portfolio || "",
    },

    stats: {
      profileCompletion,
      verifiedSkills: verifiedCount,
      totalSkills: (readinessData.requiredSkills || []).length,
      matchedJobs: jobMatches.filter((job) => job.match?.isFit).length,
      activeApplications: 0,
    },

    readiness:
      readinessData.readiness?.score === null || readinessData.readiness?.score === undefined
        ? null
        : readinessData.readiness,

    skillGaps,

    matchedJobs: jobMatches.slice(0, 4).map((job) => ({
      role: job.title,
      company: (job.company || "?").slice(0, 1).toUpperCase(),
      companyName: job.company,
      location: job.location || "Remote / flexible",
      match: job.match?.score || 0,
    })),

    nextStep: {
      title:
        experience.length === 0
          ? "Add your experience"
          : parsedSkills.length === 0
          ? "Complete your skills"
          : "Keep improving your profile",

      description:
        experience.length === 0
          ? "Add projects, internships, or work experience to strengthen your placement profile."
          : parsedSkills.length === 0
          ? "Your resume has not provided any parsed skills yet."
          : "Your profile is ready for the next stage of placement preparation.",

      action: "View profile",
    },
  };
}
