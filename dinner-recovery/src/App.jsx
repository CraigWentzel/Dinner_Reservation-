import GuestReservationForm from './components/GuestReservationForm';
import Confirmation from './pages/Confirmation';
import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import RestaurantDashboard from './components/RestaurantDashboard.jsx';
import Dashboard from "./components/Dashboard";
import MyBookings from './pages/MyBookings.jsx';



export default function App() {
  return (
    <>
    <div className="bg-emerald-600 text-white text-center text-2xl font-semibold tracking-wide py-4 shadow-md">
  Dinner Reservation Platform
</div>


      <Router>
        <Routes>
          <Route path="/reserve" element={<GuestReservationForm />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/" element={<Navigate to="/reserve" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<RestaurantDashboard />} />
          <Route path="/my-bookings" element={<MyBookings />} />

        </Routes>
      </Router>
    </>
  );
}