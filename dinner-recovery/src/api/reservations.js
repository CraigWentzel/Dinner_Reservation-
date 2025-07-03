import axios from 'axios';

// Create a reservation
export const createReservation = (data, token) => {
  return axios.post('/api/reservations', data, {
    headers: {
      Authorization: `Bearer ${token}`, // Fix typo: "Authoriazation" -> "Authorization"
    },
  });
};

// Fetch all reservations
export const fetchReservations = (token) => {
  return axios.get('/api/reservations', {
    headers: {
      Authorization: `Bearer ${token}`, // Include token if authentication is required
    },
  });
};