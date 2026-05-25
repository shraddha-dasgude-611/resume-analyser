import axios from 'axios';

const BASE = 'http://localhost:5000/api';

export const analyseResume = async (file, position) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('position', position);

  const { data } = await axios.post(`${BASE}/resume/analyse`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  console.log('API Response:', data);
  return data;
};

export const fetchJobs = async (position) => {
  const { data } = await axios.get(`${BASE}/jobs/search`, {
    params: { position }
  });
  return data;
};

export const fetchHistory = async () => {
  const { data } = await axios.get(`${BASE}/resume/history`);
  return data;
};

export const generateQuestions = async (position, resumeText, type = 'both') => {
  const { data } = await axios.post(`${BASE}/interview/generate`, {
    position, resumeText, type
  });
  return data;
};

export const evaluateAnswer = async (question, answer, position) => {
  const { data } = await axios.post(`${BASE}/interview/evaluate`, {
    question, answer, position
  });
  return data;
};