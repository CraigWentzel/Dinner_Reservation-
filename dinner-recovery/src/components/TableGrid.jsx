export default function TableGrid({ tables }) {
  if (!tables?.length) {
    return <p className="text-gray-500 mt-4">Loading table data…</p>;
  }

  return (
    <section className="mt-10">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Table Management</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`rounded-lg p-4 shadow ${
              table.status === 'available' ? 'bg-emerald-100' : 'bg-gray-200'
            }`}
          >
            <h4 className="font-semibold">{table.name}</h4>
            {table.status === 'booked' ? (
              <p className="text-sm text-gray-700">
                Reserved for {table.guest} at {table.time}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Available</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}