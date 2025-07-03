import { useState, useEffect } from 'react';
import axios from 'axios';
import ToastBanner from './ToastBanner.jsx';
import { format } from 'date-fns';

export default function GuestBookingList() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) return;

    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/reservations/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetch response:', response.data);
        const bookings = Array.isArray(response.data) ? response.data : response.data.results || [];
        setReservations(bookings);
      } catch (error) {
        console.error('Failed to load reservations:', error);
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  const confirmReschedule = async (reservationId) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/reservations/${reservationId}/confirm_reschedule/`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage('✅ Reservation confirmed!');
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, guest_confirmed: true, status: 'approved' } : res
        )
      );
    } catch (err) {
      console.error('Reschedule confirmation failed:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="flex space-x-2">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-serif mb-6">Your Reservations</h2>

      {successMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <ToastBanner
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        </div>
      )}

      {reservations.length === 0 ? (
        <p className="text-gray-600">No bookings found.</p>
      ) : (
        <ul className="space-y-6">
  {reservations.map((res) => (
    <li key={res.id} className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-800">
          {format(new Date(res.date), 'dd-MM-yyyy')} at {res.time}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            res.status === 'approved'
              ? 'bg-green-100 text-green-700'
              : res.status === 'reschedule_requested'
              ? 'bg-yellow-100 text-yellow-800'
              : res.status === 'cancelled'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {res.status.replace('_', ' ')}
        </span>
      </div>

      <p className="text-sm text-gray-600">Guests: {res.guest_count || '—'}</p>

      {/* Full breakdown for reschedule requests */}
      {res.status === 'reschedule_requested' && !res.guest_confirmed && (
        <div className="mt-4">
          <p className="text-sm text-gray-700 mb-2">
            🕑 Proposed new time:{' '}
            <strong>{format(new Date(res.proposed_date), 'dd-MM-yyyy')} at {res.proposed_time}</strong>
          </p>
          <p className="text-sm text-gray-600">Name: {res.first_name} {res.last_name}</p>
          <p className="text-sm text-gray-600">Email: {res.email}</p>
          <p className="text-sm text-gray-600">Mobile: {res.mobile_number}</p>
          {res.special_requests && (
            <p className="text-sm italic text-gray-500">Note: {res.special_requests}</p>
          )}
          <button
            onClick={() => confirmReschedule(res.id)}
            className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition"
          >
            Confirm New Time
          </button>
        </div>
      )}
    </li>
  ))}
</ul>
      )}
</div>
 );
  }