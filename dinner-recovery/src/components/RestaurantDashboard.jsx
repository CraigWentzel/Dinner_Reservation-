import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CalendarIcon } from '@heroicons/react/24/outline';

const statusLabels = {
  pending: "🕗 Pending",
  approved: "✅ Confirmed",
  reschedule_requested: "📅 Reschedule Requested",
  cancelled: "❌ Cancelled"
};

const RestaurantDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });
  const [rescheduleDrafts, setRescheduleDrafts] = useState({});
  const [showProposeForm, setShowProposeForm] = useState({});
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get("http://127.0.0.1:8000/api/dashboard-data/", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const updateStatus = async (id, newStatus, extras = {}) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.patch(
        `http://127.0.0.1:8000/api/reservations/${id}/`,
        { status: newStatus, ...extras },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchDashboardData();
      showToast(`Updated to ${newStatus.replace(/_/g, " ")}`, newStatus);
    } catch (err) {
      console.error(err);
      showToast("Status update failed.", "error");
    }
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const toastStyle = {
    approved: "bg-green-600 text-white",
    cancelled: "bg-red-600 text-white",
    reschedule_requested: "bg-blue-600 text-white",
    error: "bg-red-500 text-white",
    info: "bg-gray-700 text-white"
  };

  const renderGroup = (label, items) => (
    <div key={label} className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{statusLabels[label]}</h2>
      {items.length === 0 ? (
        <p className="text-gray-400 italic">No reservations found.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((r) => (
            <li key={r.id} className="border-b pb-4">
              <div className="mb-2">
                <p><strong>Guest:</strong> {r.first_name} {r.last_name}</p>
                <p><strong>Contact:</strong> {r.email || "—"} | {r.mobile_number || "—"}</p>
                <p><strong>Date:</strong> {r.date} at {r.time}</p>
                <p><strong>Guests:</strong> {r.guests}</p>
                <p><strong>Status:</strong> {r.status.replace(/_/g, " ")}</p>
                {r.proposed_date && r.proposed_time && (
                  <p><strong>Proposed:</strong> {r.proposed_date} @ {r.proposed_time}</p>
                )}
                {r.guest_confirmed && r.status === "approved" && (
                  <p className="text-green-600 font-medium">✅ Guest confirmed</p>
                )}
              </div>

              {showProposeForm[r.id] && (
                <div className="flex gap-2 items-end flex-wrap">
                  <div>
                    <label className="text-sm block text-gray-600">Date</label>
                    <input
                      type="date"
                      value={rescheduleDrafts[r.id]?.date || ""}
                      onChange={(e) =>
                        setRescheduleDrafts((prev) => ({
                          ...prev,
                          [r.id]: { ...prev[r.id], date: e.target.value }
                        }))
                      }
                      className="border px-2 py-1 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm block text-gray-600">Time</label>
                    <input
                      type="time"
                      value={rescheduleDrafts[r.id]?.time || ""}
                      onChange={(e) =>
                        setRescheduleDrafts((prev) => ({
                          ...prev,
                          [r.id]: { ...prev[r.id], time: e.target.value }
                        }))
                      }
                      className="border px-2 py-1 rounded text-sm"
                    />
                  </div>
                  <button
                    onClick={() =>
                      updateStatus(r.id, "reschedule_requested", {
                        proposed_date: rescheduleDrafts[r.id]?.date,
                        proposed_time: rescheduleDrafts[r.id]?.time
                      })
                    }
                    disabled={
                      !rescheduleDrafts[r.id]?.date || !rescheduleDrafts[r.id]?.time
                    }
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Propose
                  </button>
                </div>
              )}

              <div className="mt-2 flex gap-2 flex-wrap">
                <button
                  onClick={() => updateStatus(r.id, "approved")}
                  disabled={r.status === "approved"}
                  className={`px-3 py-1 text-sm rounded ${
                    r.status === "approved"
                      ? "bg-green-300 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(r.id, "cancelled")}
                  disabled={r.status === "cancelled"}
                  className={`px-3 py-1 text-sm rounded ${
                    r.status === "cancelled"
                      ? "bg-red-300 text-white cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  Cancel
                </button>

                <button
                  onClick={() =>
                    setShowProposeForm((prev) => ({
                      ...prev,
                      [r.id]: !prev[r.id]
                    }))
                  }
                  className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  {showProposeForm[r.id] ? "Hide Form" : "Reschedule"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      {toast.message && (
        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow ${toastStyle[toast.type] || "bg-gray-700 text-white"}`}
        >
          {toast.message}
        </div>
      )}

      <header className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
         <CalendarIcon className="h-6 w-6 text-emerald-600" aria-label="Dashboard" />
           <h1 className="text-2xl font-bold text-gray-800">Dinner Dashboard</h1>
      </div>
    
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      <button
        onClick={fetchDashboardData}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-6"
      >
        🔄 Refresh Data
      </button>

      <div className="bg-white shadow-md rounded-lg p-6">
        {Object.keys(statusLabels).map((key) =>
          renderGroup(key, stats[key] || [])
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;