import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api/users' });
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('placeReadyToken')}` });
export const getJobs = () => api.get('/jobs/matches', { headers: headers() }).then((r) => r.data);
export const createJob = (job) => api.post('/jobs', job, { headers: headers() }).then((r) => r.data);
export const getQuestions = (skill) => api.get(`/assessments/questions/${encodeURIComponent(skill)}`, { headers: headers() }).then((r) => r.data);
export const submitAssessment = (payload) => api.post('/assessments', payload, { headers: headers() }).then((r) => r.data);
export const getAssessments = () => api.get('/assessments', { headers: headers() }).then((r) => r.data);
export const getReadiness = () => api.get('/readiness', { headers: headers() }).then((r) => r.data);
