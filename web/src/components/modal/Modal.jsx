import React from "react";

function Modal({ children, modalState }) {
  return (
    <>
      {modalState && (
        <div className=" w-screen h-screen fixed p-6 top-0 left-0 bg-black/50 z-20 flex justify-center items-center">
          <div className="bg-gradient-to-tr from-pink-50 to-emerald-50 p-6 rounded-lg shadow-2xl flex flex-col justify-around">
            {children}
          </div>
        </div>
      )}
    </>
  );
}

export default Modal;
