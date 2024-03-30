import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import userServices from "../../../services/users"


function UserDetail() {
  const [ user, setUser ] = useState({})
  const { id } = useParams();

  useEffect(() => {
    userServices.detail(id)
      .then((user) => {
        setUser(user)
      })
      .catch((error) => console.error(error))
  }, [])


  return (
    <div>
      <p>UserDetail</p>
      <p>{user.name} </p>
    </div>
  )
}

export default UserDetail