import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { CalendarIcon } from '@heroicons/react/24/outline';
import ToastBanner from '../components/ToastBanner.jsx';

export default function MyBookings() {
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
        const bookings = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
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

  const sorted = [...reservations].sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcoming = sorted.filter((res) => new Date(res.date) >= new Date());
  const past = sorted.filter((res) => new Date(res.date) < new Date());

  const renderBooking = (res) => {
    const isPast = new Date(res.date) < new Date();

    return (
      <li
        key={res.id}
        className={`border rounded-lg p-4 shadow-sm ${
          isPast ? 'bg-gray-50 border-gray-200' : 'bg-white'
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <h3
            className={`text-lg font-bold ${
              isPast ? 'text-gray-500' : 'text-gray-800'
            }`}
          >
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

        <p className={`text-sm ${isPast ? 'text-gray-400' : 'text-gray-600'}`}>
          <span className="font-semibold">Name:</span> {res.first_name} {res.last_name}
        </p>
        <p className={`text-sm ${isPast ? 'text-gray-400' : 'text-gray-600'}`}>
          <span className="font-semibold">Email:</span> {res.email}
        </p>
        <p className={`text-sm ${isPast ? 'text-gray-400' : 'text-gray-600'}`}>
          <span className="font-semibold">Mobile:</span> {res.mobile_number}
        </p>
        {typeof res.guest_count === 'number' && (
          <p className={`text-sm ${isPast ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="font-semibold">Guests:</span> {res.guest_count}
          </p>
        )}
        {res.special_requests && (
          <p className={`text-sm italic ${isPast ? 'text-gray-300' : 'text-gray-500'}`}>
            <span className="font-semibold">Note:</span> {res.special_requests}
          </p>
        )}

        {res.status === 'reschedule_requested' && !res.guest_confirmed && (
          <div className="mt-4">
            <p className="text-sm text-gray-700 mb-2">
              🕑 Proposed new time:{' '}
              <strong>
                {format(new Date(res.proposed_date), 'dd-MM-yyyy')} at {res.proposed_time}
              </strong>
            </p>
            <button
              onClick={() => confirmReschedule(res.id)}
              className="mt-2 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition"
            >
              Confirm New Time
            </button>
          </div>
        )}
      </li>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-bounce text-emerald-600 text-sm font-medium">Loading bookings…</div>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <CalendarIcon className="h-6 w-6 text-emerald-600" aria-label="Reservations" />
          <h1 className="text-2xl font-bold text-gray-800">My Reservations</h1>
        </div>

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
          <>
            {upcoming.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Bookings</h2>
                <ul className="space-y-6">{upcoming.map(renderBooking)}</ul>
              </>
            )}
            {past.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-4">Past Bookings</h2>
                <ul className="space-y-6">{past.map(renderBooking)}</ul>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}