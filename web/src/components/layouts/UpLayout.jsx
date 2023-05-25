import React from 'react'
import layoutLogo from "../../images/logo-la-vin-simplificado.png"

function UpLayout() {
  return (
    <>
      <div className='flex justify-center bg-gradient-to-r from-pink-200 via-white to-emerald-200 '>
        <img src={layoutLogo} alt="logo la vin nails simplificado"
        className='h-8 m-2' />
      </div>
      <div className=' bg-pink-300 h-1'/>
    </>

  )
}

export default UpLayout