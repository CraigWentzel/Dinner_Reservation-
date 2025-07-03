import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ToastBanner from './ToastBanner.jsx';
import { CalendarIcon } from '@heroicons/react/24/outline';

export default function GuestReservationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => setSuccess(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [success]);

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      mobile_number: '',
      date: '',
      time: '',
      guests: 1,
      special_requests: '',
    },
    validationSchema: Yup.object({
      date: Yup.string().required('Please select a date'),
      time: Yup.string().required('Please select a time'),
      guests: Yup.number().min(1).max(12).required('Number of guests is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        setSubmitting(true);
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('Session expired. Please log in again.');
          window.location.href = '/login';
          return;
        }

        await axios.post('http://127.0.0.1:8000/api/reservations/', values, {
          headers: { Authorization: `Bearer ${token}` },
        });

        resetForm();
        setSuccess(true);
        setTimeout(() => navigate('/my-bookings'), 1500);
      } catch (err) {
        console.error('Reservation failed:', err);
        alert('Something went wrong.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <CalendarIcon className="h-6 w-6 text-emerald-600" aria-label="Booking" />
          <h1 className="text-2xl font-bold text-gray-800">Guest Reservation</h1>
        </div>

        <p className="text-lg text-gray-500 mb-6">
          Reserve your table and tell us how you'd like your experience tailored.
        </p>

        {success && (
          <ToastBanner
            type="success"
            message="Reservation submitted successfully! Redirecting to your bookings page."
            onClose={() => setSuccess(false)}
          />
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">First Name:</label>
              <input type="text" {...formik.getFieldProps('first_name')} className="input-class" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Last Name:</label>
              <input type="text" {...formik.getFieldProps('last_name')} className="input-class" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address:</label>
              <input type="email" {...formik.getFieldProps('email')} className="input-class" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Mobile Number:</label>
              <input type="tel" {...formik.getFieldProps('mobile_number')} className="input-class" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Date:</label>
              <input type="date" {...formik.getFieldProps('date')} className="input-class" />
              {formik.touched.date && formik.errors.date && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.date}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Time:</label>
              <input type="time" {...formik.getFieldProps('time')} className="input-class" />
              {formik.touched.time && formik.errors.time && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.time}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Guests</label>
              <input
                type="number"
                min="1"
                max="12"
                {...formik.getFieldProps('guests')}
                className="input-class"
              />
              {formik.touched.guests && formik.errors.guests && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.guests}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Special Requests:</label>
            <textarea
              rows="4"
              {...formik.getFieldProps('special_requests')}
              className="block w-full rounded-md border border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              placeholder="Seating preferences, allergies, or anything else we should know?"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            Reserve
          </button>
        </form>
      </div>
    </main>
  );
}