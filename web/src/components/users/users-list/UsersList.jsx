import React from 'react'
import UserItem from '../user-item/UserItem'

function UsersList({ users }) {
  return (
    <div className='grid grid-cols-1 grid-flow-row w-full max-w-md'>
      {users.map((user) => (
        <UserItem user={user} key={user.id} />
      ))}
    </div>
  )
}

export default UsersList