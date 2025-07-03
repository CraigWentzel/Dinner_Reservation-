import React from "react";

const Header = () => {
  return (
    <header className="bg-green-700 text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold">Dinner Reservation Dashboard</h1>
      <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
        Logout
      </button>
    </header>
  );
};

export default Header;