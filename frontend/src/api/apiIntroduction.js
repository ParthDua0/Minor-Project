import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api/users";

const introductionApi = axios.create({
  baseURL: API_BASE_URL,
});

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  const token = localStorage.getItem("placeReadyToken");

  const response = await introductionApi.post("/resume", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function saveIntroduction(data) {
  const token = localStorage.getItem("placeReadyToken");

  const response = await introductionApi.post(
    "/user-edit",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}