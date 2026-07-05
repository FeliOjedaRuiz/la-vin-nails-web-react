import React, { useEffect, useState } from "react";
import UsersList from "../users-list/UsersList";
import UsersService from "../../../services/users"
import UsersSearchBar from './../users-search-bar/UsersSearchBar';

function UsersSearchComponent() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const fetchUsers = () => {
    UsersService.list()
      .then((users) => {
        setUsers(users)
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSearch = (value) => {
    setSearch(value);
  };

  const handleToggleBlock = () => {
    fetchUsers();
  };

  const usersToShow = users.filter(u => u.name.toLowerCase().includes(search.toLocaleLowerCase()))

  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-2xl font-bold text-center color text-pink-700">
        Usuarios:
      </h3>
      <UsersSearchBar search={search} onSearch={onSearch} />
      <UsersList users={usersToShow} onToggleBlock={handleToggleBlock} />
    </div>
  );
}

export default UsersSearchComponent;
