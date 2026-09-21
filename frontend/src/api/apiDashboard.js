// src/api/dashboardApi.js

import { mockDashboardData } from "../data/mockDashboard";

export async function getDashboardData() {
  // Temporary mock API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDashboardData);
    }, 500);
  });

  /*
  // Later, when backend is ready:

  import axios from "axios";

  const response = await axios.get("/api/dashboard");

  return response.data;
  */
}