import React, { createContext, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const restoreUserFromLocalStorage = () => {
  const user = localStorage.getItem("current-user");
  if (user) {
    return JSON.parse(user);
  } else {
    return undefined;
  }
};

function AuthStore({ children }) {
  const [user, setUser] = useState(restoreUserFromLocalStorage());
  const [currentWeek, setCurrentWeek] = useState();
  const navigate = useNavigate();

  const handleUserChange = useCallback((user) => {
    console.log("Updating user context", user);
    if (!user) {
      localStorage.removeItem("user-access-token");
      localStorage.removeItem("current-user");
      localStorage.removeItem("current-week");
    } else {
      localStorage.setItem("user-access-token", user.token);
      localStorage.setItem("current-user", JSON.stringify(user));
    }
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    handleUserChange();
    navigate("/login");
  }, []);

  const handleWeekSelect = (week) => {
    console.log('Updating week context', week)
    if (!week) {
      localStorage.removeItem('current-week');
    } else {
      localStorage.setItem('current-week', JSON.stringify(week))
    }
    setCurrentWeek(week);
  }


  return (
    <AuthContext.Provider
      value={{ user, currentWeek, onUserChange: handleUserChange, logout, onWeekSelect: handleWeekSelect }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthStore as default, AuthContext };
