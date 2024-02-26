import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthStore";

function UnlogedRoute({ children }) {
  const { logout, user } = useContext(AuthContext);

  if (user) {
    logout();
    return <>{children}</>;
  } else if (!user) {
    return <>{children}</>;
  } else {
    return <Navigate to="/error-page" replace={true} />;
  }
}

export default UnlogedRoute;
