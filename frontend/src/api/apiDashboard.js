import { getUserInfo } from "./apiAuth";
import { getJobs } from "./apiCareer";

export async function getDashboardData() {
  const response = await getUserInfo();
  let jobMatches = [];
  try {
    const jobData = await getJobs();
    jobMatches = jobData.jobs || [];
  } catch (error) {
    // A recruiter account or an unavailable jobs service should not prevent
    // the profile dashboard from loading.
    console.warn('Job matches are unavailable', error);
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

  /*
   * These values are not available from /user-info yet.
   * Do NOT use fake/mock values here.
   */
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

  const profileCompletion = response?.profileCompletion ?? Math.round(
    (completedFields / profileFields.length) * 100
  );

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
      verifiedSkills: 0,
      totalSkills: parsedSkills.length,
      matchedJobs: jobMatches.filter((job) => job.match?.isFit).length,
      activeApplications: 0,
    },

    /*
     * These will be connected to real backend APIs later.
     */
    readiness: parsedSkills.length ? { score: Math.round((profileCompletion * 0.4) + (Math.min(parsedSkills.length, 10) * 6)), change: 0 } : null,
    skillGaps: [],
    matchedJobs: jobMatches.slice(0, 4).map((job) => ({
      role: job.title,
      company: (job.company || '?').slice(0, 1).toUpperCase(),
      companyName: job.company,
      location: job.location || 'Remote / flexible',
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
