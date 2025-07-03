import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GuestReservationForm from './components/GuestReservationForm';
import Confirmation from './pages/Confirmation'; 
import { Navigate } from 'react-router-dom';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/reserve" element={<GuestReservationForm />} />
        <Route path="/confirmation" element={<Confirmation />} /> 
        <Route path="/" element={<Navigate to="/reserve" replace />} />

      </Routes>
    </Router>
  );
}