import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthStore';

function PrivateRoute({ children, role }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace={true} />
  } else if (!role || role === user.role) {
    return <>{children}</>
  } else {
    return <Navigate to="/403" replace={true} />
  }
}

export default PrivateRoute