import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
      date: '',
      time: '',
      guests: 1,
      special_request: '',
    },
    validationSchema: Yup.object({
      date: Yup.string().required('Please select a date'),
      time: Yup.string().required('Please select a time'),
      guests: Yup.number().min(1).max(12).required('Number of guests is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        setSubmitting(true);
        const token = localStorage.getItem('token');
        await axios.post('/api/reservations/', values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        resetForm();
        setSuccess(true);
        navigate('/confirmation');
      } catch (err) {
        console.error(err);
        alert('Something went wrong.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-[#fefcf9] px-4 py-10 font-sans">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-lg p-8 border border-gray-200">
        <h1 className="text-4xl font-serif text-center text-gray-900 mb-2">Reserve a Table</h1>
        <p className="text-center text-gray-500 text-lg mb-8">Coastal elegance. Culinary excellence.</p>

        {success && (
          <div className="mb-4 p-3 text-green-800 bg-green-100 border border-green-300 rounded animate-fade-in-down transition ease-out duration-700">
            🎉 Reservation submitted successfully!
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                {...formik.getFieldProps('date')}
                className="w-full rounded border border-gray-300 px-4 py-2 shadow-sm focus:ring-emerald-500 focus:outline-none"
              />
              {formik.touched.date && formik.errors.date && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.date}</div>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Time</label>
              <input
                type="time"
                {...formik.getFieldProps('time')}
                className="w-full rounded border border-gray-300 px-4 py-2 shadow-sm focus:ring-emerald-500 focus:outline-none"
              />
              {formik.touched.time && formik.errors.time && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.time}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Number of Guests</label>
            <input
              type="number"
              min="1"
              max="12"
              {...formik.getFieldProps('guests')}
              className="w-full rounded border border-gray-300 px-4 py-2 shadow-sm focus:ring-emerald-500 focus:outline-none"
            />
            {formik.touched.guests && formik.errors.guests && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.guests}</div>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Special Requests</label>
            <textarea
              rows="3"
              {...formik.getFieldProps('special_request')}
              className="w-full rounded border border-gray-300 px-4 py-2 shadow-sm focus:ring-emerald-500 focus:outline-none resize-none"
              placeholder="Let us know if you're celebrating something special."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded shadow transition-colors duration-300"
          >
            {submitting ? 'Submitting...' : 'Reserve Now'}
          </button>
        </form>
      </div>
    </div>
  );
}