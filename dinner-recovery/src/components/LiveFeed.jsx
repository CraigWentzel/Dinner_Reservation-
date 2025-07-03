export default function LiveFeed({ upcoming = [] }) {
  return (
    <section className="mt-10">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Live Reservation Feed</h3>
      <div className="bg-white rounded-xl shadow p-4 border text-gray-600">
        {upcoming.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {upcoming.map((r, i) => (
              <li key={i} className="py-3 flex justify-between">
                <span>{r.guest}</span>
                <span>{r.time}</span>
                <span>{r.guests} guests</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming reservations yet.</p>
        )}
      </div>
    </section>
  );
}