export default function DashboardTile({ label, value, color = "text-gray-800" }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-sm text-gray-500 uppercase tracking-wide">{label}</h2>
      <p className={`text-2xl font-semibold mt-2 ${color}`}>
        {value !== undefined && value !== null ? value : '—'}
      </p>
    </div>
  );
}