import React from 'react'
import layoutLogo from "../../images/logo-la-vin-simplificado-3.png"

function UpLayout() {
  return (
    <>
      <div className='flex justify-center bg-gradient-to-r from-pink-200 via-white to-emerald-200 border-b-2 border-pink-400 '>
        <img src={layoutLogo} alt="logo la vin nails simplificado"
        className='h-8 m-2 ' />
      </div>
    </>

  )
}

export default UpLayout