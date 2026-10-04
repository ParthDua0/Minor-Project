// src/api/apiProfile.js

import axios from "axios";
import { getUserInfo } from "./apiAuth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api/users";

const profileApi = axios.create({
  baseURL: API_BASE_URL,
});

function getAuthHeaders() {
  const token = localStorage.getItem("placeReadyToken");

  return {
    Authorization: `Bearer ${token}`,
  };
}

/* -------------------------------------------------------------------------- */
/* GET PROFILE                                                                */
/* -------------------------------------------------------------------------- */

export async function getProfileData() {
  const response = await getUserInfo();
  let cloudinaryResumeUrl = "";

  if (response?.resume?.uploaded) {
    try {
      const linkResponse = await profileApi.get("/resume-link", {
        headers: getAuthHeaders(),
      });
      cloudinaryResumeUrl = linkResponse.data?.url || "";
    } catch (error) {
      // Keep the saved URL as a fallback if Cloudinary is temporarily unavailable.
      console.warn("Could not refresh the Cloudinary resume link", error);
    }
  }

  // The backend returns the normalised ProfileResponse shape.  Keep the
  // mapping here only for form-specific defaults and UI-only fields.
  const user = response?.user || {};
  const profile = response || {};

  return {
    user: {
      name: user.fullname || "Student",
      fullname: user.fullname || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "student",
      graduationYear: user.graduationYear || "",
    },

    courseName: profile.courseName || "",
    branch: profile.branch || "",
    cgpa: profile.cgpa ?? "",
    currentYear: profile.currentYear ?? "",

    targetRoles: Array.isArray(profile.targetRoles)
      ? profile.targetRoles
      : [],

    customGoal: profile.customGoal || "",

    employmentType: profile.employmentType || "both",

    workPreference: Array.isArray(profile.workPreference)
      ? profile.workPreference
      : [],

    resume: profile.resume?.uploaded
      ? {
          uploaded: true,
          url: cloudinaryResumeUrl || profile.resume.url,
          fileName: profile.resume.fileName || "Uploaded resume",
        }
      : {
          uploaded: false,
          url: "",
          fileName: "",
        },

    education: Array.isArray(profile.education)
      ? profile.education
      : [],

    experience: Array.isArray(profile.experience)
      ? profile.experience.map((item, index) => ({
          ...item,
          id: item._id || item.id || `experience-${index}`,
          title: item.title || "",
          org: item.org || "",
          durationMonths: item.durationMonths ?? "",
          description: item.description || "",
          highlights: Array.isArray(item.highlights) ? item.highlights : [],
        }))
      : [],

    parsedSkills: Array.isArray(profile.parsedSkills)
      ? profile.parsedSkills
      : [],

    summary: profile.summary || "",
    projects: Array.isArray(profile.projects) ? profile.projects : [],
    certifications: Array.isArray(profile.certifications)
      ? profile.certifications
      : [],
    totalExperienceMonths: profile.totalExperienceMonths ?? 0,

    linkedin: profile.linkedin || "",
    github: profile.github || "",
    portfolio: profile.portfolio || "",

    profileCompletion: calculateProfileCompletion(
      user,
      profile
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* PROFILE COMPLETION                                                         */
/* -------------------------------------------------------------------------- */

function calculateProfileCompletion(user, profile) {
  const targetRoles = Array.isArray(profile.targetRoles)
    ? profile.targetRoles
    : [];

  const parsedSkills = Array.isArray(profile.parsedSkills)
    ? profile.parsedSkills
    : [];

  const education = Array.isArray(profile.education)
    ? profile.education
    : [];

  const experience = Array.isArray(profile.experience)
    ? profile.experience
    : [];

  const fields = [
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
    education.length > 0,
    experience.length > 0,
  ];

  const completed = fields.filter(Boolean).length;

  return Math.round((completed / fields.length) * 100);
}

/* -------------------------------------------------------------------------- */
/* UPDATE PROFILE                                                             */
/* -------------------------------------------------------------------------- */

export async function updateProfile(profileData) {
  const payload = {
    fullname: profileData.user?.fullname || "",
    email: profileData.user?.email || "",
    phone: profileData.user?.phone || "",

    graduationYear: profileData.user?.graduationYear
      ? Number(profileData.user.graduationYear)
      : undefined,

    role: profileData.user?.role || "student",

    profile: {
      courseName: profileData.courseName?.trim() || "",
      branch: profileData.branch || "",

      cgpa:
        profileData.cgpa !== "" &&
        profileData.cgpa !== null &&
        profileData.cgpa !== undefined
          ? Number(profileData.cgpa)
          : undefined,

      currentYear:
        profileData.currentYear !== "" &&
        profileData.currentYear !== null &&
        profileData.currentYear !== undefined
          ? Number(profileData.currentYear)
          : undefined,

      targetRoles: Array.isArray(profileData.targetRoles)
        ? profileData.targetRoles
        : [],

      employmentType:
        profileData.employmentType || "both",

      workPreference: Array.isArray(
        profileData.workPreference
      )
        ? profileData.workPreference
        : [],

      customGoal:
        profileData.customGoal?.trim() || "",

      summary: profileData.summary?.trim() || "",
    },

    education: Array.isArray(profileData.education)
      ? profileData.education.map((item) => ({
          degree: item.degree || "",
          branch: item.branch || "",
          institute:
            item.institute || item.institution || "",
          startYear: item.startYear !== "" && item.startYear != null ? Number(item.startYear) : undefined,
          year: item.year !== "" && item.year != null ? Number(item.year) : undefined,
          cgpa: item.cgpa !== "" && item.cgpa != null ? Number(item.cgpa) : undefined,
          percentage: item.percentage !== "" && item.percentage != null ? Number(item.percentage) : undefined,
        }))
      : [],

    experience: Array.isArray(profileData.experience)
      ? profileData.experience.map((item) => ({
          title: item.title || "",
          org: item.org || "",
          startDate: item.startDate || undefined,
          endDate: item.isCurrent ? undefined : item.endDate || undefined,
          isCurrent: Boolean(item.isCurrent),
          durationMonths:
            item.durationMonths !== "" &&
            item.durationMonths !== null &&
            item.durationMonths !== undefined
              ? Number(item.durationMonths)
              : undefined,
          highlights: Array.isArray(item.highlights) ? item.highlights : [],
          description: item.description || "",
        }))
      : [],

    parsedSkills: Array.isArray(profileData.parsedSkills)
      ? profileData.parsedSkills
      : [],

    projects: Array.isArray(profileData.projects)
      ? profileData.projects.map((item) => ({
          name: item.name || "",
          description: item.description || "",
          techStack: Array.isArray(item.techStack) ? item.techStack : [],
          link: item.link || "",
        }))
      : [],

    certifications: Array.isArray(profileData.certifications)
      ? profileData.certifications
      : [],

    linkedin: profileData.linkedin || "",
    github: profileData.github || "",
    portfolio: profileData.portfolio || "",
  };

  const response = await profileApi.post(
    "/user-edit",
    payload,
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

/* -------------------------------------------------------------------------- */
/* RESUME UPLOAD                                                              */
/* -------------------------------------------------------------------------- */

export async function uploadResume(file) {
  const formData = new FormData();

  formData.append("resume", file);

  const response = await profileApi.post(
    "/resume",
    formData,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  return response.data;
}

export async function deleteResume() {
  const response = await profileApi.delete("/resume", {
    headers: getAuthHeaders(),
  });

  return response.data;
}
