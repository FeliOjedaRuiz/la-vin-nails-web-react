import React, { useEffect, useState } from "react";
import UsersList from "../users-list/UsersList";
import UsersService from "../../../services/users"
import UsersSearchBar from './../users-search-bar/UsersSearchBar';

function UsersSearchComponent() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    UsersService.list()
      .then((users) => {
        setUsers(users)
      })
      .catch((error) => console.error(error));
  }, []);

  const onSearch = (value) => {
    setSearch(value);
  };

  

  const usersToShow = users.filter(u => u.name.toLowerCase().includes(search.toLocaleLowerCase()))

  return (
    <div className="flex flex-col items-center max-w-md w-full p-4">
      <h3 className="text-3xl mt-3 font-bold text-center color text-pink-700">
        Usuarios:
      </h3>
      <UsersSearchBar search={search} onSearch={onSearch} />
      <UsersList users={usersToShow} />
    </div>
  );
}

export default UsersSearchComponent;
