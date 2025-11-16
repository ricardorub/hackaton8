import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000', // Replace with your Flask backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getVotingCenters = () => {
  return apiClient.get('/api/centrosvotacion');
};

export const getTables = () => {
  return apiClient.get('/api/mesas');
};
