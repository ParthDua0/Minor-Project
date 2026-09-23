import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Login
export async function loginUser({ email, password, role }) {
  const response = await authApi.post("/api/auth/login", {
    email,
    password,
    role,
  });

  return response.data;
}

// Send email OTP
export async function sendEmailOtp(email) {
  const response = await authApi.post("/api/auth/send-email-otp", {
    email,
  });

  return response.data;
}

// Verify email OTP
export async function verifyEmailOtp(email, otp) {
  const response = await authApi.post("/api/auth/verify-email-otp", {
    email,
    otp,
  });

  return response.data;
}

// Signup
export async function signupUser(formData) {
  const response = await authApi.post("/api/auth/signup", formData);

  return response.data;
}