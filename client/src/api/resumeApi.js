import axios from 'axios';

const BASE = '/api';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const analyseResume = async (file, position) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('position', position);

  const { data } = await axios.post(`${BASE}/resume/analyse`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...authHeaders()
    }
  });
  return data;
};

export const fetchJobs = async (position) => {
  const { data } = await axios.get(`${BASE}/jobs/search`, {
    params: { position },
    headers: authHeaders()
  });
  return data;
};

export const fetchHistory = async () => {
  const { data } = await axios.get(`${BASE}/resume/history`, {
    headers: authHeaders()
  });
  return data;
};

export const generateQuestions = async (position, resumeText, type = 'both') => {
  const { data } = await axios.post(`${BASE}/interview/generate`,
    { position, resumeText, type },
    { headers: authHeaders() }
  );
  return data;
};

export const evaluateAnswer = async (question, answer, position) => {
  const { data } = await axios.post(`${BASE}/interview/evaluate`,
    { question, answer, position },
    { headers: authHeaders() }
  );
  return data;
};

export const loginUser = async (email, password) => {
  const { data } = await axios.post(`${BASE}/auth/login`, { email, password });
  return data;
};

export const registerUser = async (name, email, password) => {
  const { data } = await axios.post(`${BASE}/auth/register`, { name, email, password });
  return data;
};