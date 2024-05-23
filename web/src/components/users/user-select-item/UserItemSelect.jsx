import React from 'react'

function UserItemSelect({ user, onUserSelect }) {

  const handleClick = () => {
    onUserSelect(user)
  }

  return (
    <li className='max-w-[325px] my-1 text-lg' onClick={handleClick} >{user.name} {user.surname}</li>
  )
}

export default UserItemSelect