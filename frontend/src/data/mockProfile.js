// src/data/mockProfile.js

export const mockProfileData = {
  user: {
    name: "Parth Dua",
    email: "parth@example.com",
    phone: "+91 9876543210",
  },

  resume: {
    uploaded: false,
    fileName: null,
    fileType: null,
    fileSize: null,
    uploadedAt: null,
  },

  education: {
    degree: "",
    institution: "",
    duration: "",
    cgpa: "",
  },

  experience: [
    {
      id: 1,
      jobTitle: "",
      company: "",
      description: "",
      startDate: "",
      endDate: "",
    },
  ],

  profileCompletion: 68,
};