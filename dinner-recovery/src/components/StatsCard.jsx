import React from "react";

const StatsCard = ({ title, value, color }) => {
  const textColor = `text-${color}-600`;
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
};

export default StatsCard;