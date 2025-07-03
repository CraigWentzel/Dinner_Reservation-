import axios from 'axios';

export const createReservation = (data, token) => {
    return axios.post( '/api/reservations', data,
      {headers: {
        Authoriazation: `Bearer ${token}`,
         },
      });
  };