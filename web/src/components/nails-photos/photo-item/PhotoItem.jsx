import React from 'react'

function PhotoItem({ photo }) {
  return (
    <div className='aspect-square overflow-hidden object-center rounded-lg shadow-md '>
      <img src={photo.photoUrl} alt="Foto de manicura" />
    </div>
  )
}

export default PhotoItem