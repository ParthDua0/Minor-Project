import { getUserInfo } from "./apiAuth";
import { getAssessments, getJobs } from "./apiCareer";

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

  // Merge resume skills and any custom-assessed skills
  const allUniqueSkills = [
    ...new Set([
      ...parsedSkills.map((s) => s.trim()),
      ...assessments.map((a) => a.skill.trim()),
    ]),
  ];

  // Unverified = not attempted yet OR score < 70%
  const skillGaps = allUniqueSkills
    .map((skill) => {
      const record = assessmentMap.get(skill.toLowerCase());
      const current = record ? record.score : 0;
      const attempted = Boolean(record);

      return {
        name: skill,
        current,
        required: 70,
        attempted,
        level: record?.level || "Unverified",
      };
    })
    .filter((item) => !item.attempted || item.current < 70)
    // Sort: attempted (< 70%) first by lowest score, then unattempted
    .sort((a, b) => {
      if (a.attempted !== b.attempted) return a.attempted ? -1 : 1;
      return a.current - b.current;
    });

  const verifiedCount = allUniqueSkills.length - skillGaps.length;

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
      totalSkills: parsedSkills.length,
      matchedJobs: jobMatches.filter((job) => job.match?.isFit).length,
      activeApplications: 0,
    },

    readiness: parsedSkills.length
      ? {
          score: Math.round(
            profileCompletion * 0.4 + Math.min(parsedSkills.length, 10) * 6
          ),
          change: 0,
        }
      : null,

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