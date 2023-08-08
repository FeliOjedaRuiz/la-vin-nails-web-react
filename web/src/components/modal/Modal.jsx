import React from "react";

function Modal({ children, modalState, setModalState }) {
  return (
    <>
      {modalState && (
        <div className=" w-screen h-screen fixed p-6 top-0 left-0 bg-black/50 z-20 flex justify-center items-center">
          <div className="bg-gradient-to-tr from-pink-200 to-emerald-100 p-6 rounded-lg shadow-2xl flex flex-col justify-around">
            {children}
          </div>
        </div>
      )}
    </>
  );
}

export default Modal;
