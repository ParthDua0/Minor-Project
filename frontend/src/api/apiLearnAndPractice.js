// src/api/apiLearnAndPractice.js

import { mockLearnAndPracticeData } from "../data/mockLearnAndPractice";

export async function getLearnAndPracticeData() {
  // Temporary mock API

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockLearnAndPracticeData);
    }, 500);
  });

  /*
  // Later, when backend is ready:

  import axios from "axios";

  const response = await axios.get("/api/learning");
  return response.data;
  */
}