import React from "react";
import { Link } from "react-router-dom";

function UserItem({ user }) {
  return (
    <Link to={`/users/${user.id}`} className="border-2 rounded-lg border-teal-700 p-2 m-2 flex flex-col wl bg-white/50">
      <p className="text-lg font-bold text-pink-600">
        {user.name} {user.surname}
      </p>
      <p>{user.phone}</p>
      <p>{user.email}</p>
    </Link>
  );
}

export default UserItem;
