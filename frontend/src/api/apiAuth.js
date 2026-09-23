import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api/users";

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// LOGIN
export async function loginUser({ email, password }) {
  const response = await authApi.post("/login", {
    email,
    password,
  });

  return response.data;
}

// SEND OTP
export async function sendOtp(email) {
  const response = await authApi.post("/send-otp", {
    email,
  });

  return response.data;
}

// VERIFY OTP
export async function verifyOtp(email, otp) {
  const response = await authApi.post("/verify-otp", {
    email,
    otp,
  });

  return response.data;
}

// REGISTER
export async function registerUser({
  fullname,
  email,
  password,
  confirm_password,
  phone,
  role,
  graduationYear,
}) {
  const response = await authApi.post("/register", {
    fullname,
    email,
    password,
    confirm_password,
    phone,
    role,
    graduationYear,
  });

  return response.data;
}