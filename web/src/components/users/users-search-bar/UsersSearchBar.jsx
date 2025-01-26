import React from "react";

function UsersSearchBar({ search, onSearch }) {
  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className="flex flex-col w-full px-2 m-2">
      {/* <label for="text" className="mb-1 ml-2 text-teal-800 font-semibold">Nombre:</label> */}
      <input
        className="p-2 w-full max-w-md border-2 border-pink-300 rounded-lg text-pink-700 font-semibold"
        type="text"
        value={search}
        onChange={handleChange}
        placeholder="Buscar usuario por nombre"
      />
    </div>
  );
}

export default UsersSearchBar;
