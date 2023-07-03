import React, { useContext } from "react";
import Layout from "../components/layouts/Layout";
import { AuthContext } from '../contexts/AuthStore';

function ProfilePage() {
  const { user } = useContext(AuthContext);


  return (
    <>
      <Layout>
        <div>
          <h1>¡Hola {user.name}!</h1>
        </div>
      </Layout>
    </>
  );
}

export default ProfilePage;
