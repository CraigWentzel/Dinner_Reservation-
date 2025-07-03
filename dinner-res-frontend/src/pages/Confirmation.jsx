export default function Confirmation() {
  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-green-50 border border-green-300 text-green-800 rounded shadow">
      <h2 className="text-2xl font-semibold mb-2">Reservation Confirmed</h2>
      <p className="text-lg">🎉 Thanks! Your booking has been submitted successfully.</p>
      <a href="/reserve" className="block mt-4 text-blue-600 hover:underline">
        Book another reservation
      </a>
    </div>
  );
}