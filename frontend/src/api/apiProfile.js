// src/api/apiProfile.js

import { mockProfileData } from "../data/mockProfile";

export async function getProfileData() {
  // Temporary mock API

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProfileData);
    }, 500);
  });

  /*
  // Later:

  import axios from "axios";

  const response = await axios.get("/api/profile");

  return response.data;
  */
}

export async function updateProfile(profileData) {
  // Temporary mock API

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Profile updated successfully",
        data: profileData,
      });
    }, 500);
  });

  /*
  // Later:

  const response = await axios.put(
    "/api/profile",
    profileData
  );

  return response.data;
  */
}

export async function uploadResume(file) {
  // Temporary mock API

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Resume uploaded successfully",
        resume: {
          uploaded: true,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
      });
    }, 800);
  });

  /*
  // Later:

  const formData = new FormData();
  formData.append("resume", file);

  const response = await axios.post(
    "/api/profile/resume",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
  */
}