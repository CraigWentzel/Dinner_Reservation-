import React, { useEffect, useState } from 'react';
import { fetchReservations } from '../api/reservations';
import { CalendarIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [reservations, setReservations] = useState([]);
  const token = 'your-auth-token-here'; // Replace with actual token

  useEffect(() => {
    const getReservations = async () => {
      try {
        const response = await fetchReservations(token);
        setReservations(response.data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };

    getReservations();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <CalendarIcon className="h-6 w-6 text-emerald-600" aria-label="Dashboard" />
        <h1 className="text-2xl font-bold text-gray-800">Dinner Dashboard</h1>
      </div>

      <ul className="divide-y divide-gray-200">
        {reservations.map((reservation) => (
          <li key={reservation.id} className="py-2">
            <span className="font-medium">{reservation.table}</span> - Status:{' '}
            <span
              className={
                reservation.status === 'booked' ? 'text-red-600' : 'text-green-600'
              }
            >
              {reservation.status}
            </span>
            {reservation.guest &&
              ` | Guest: ${reservation.guest} | Time: ${reservation.time}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;