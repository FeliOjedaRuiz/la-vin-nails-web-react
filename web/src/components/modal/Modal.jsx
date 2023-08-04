import React from "react";

function Modal({ children, modalState, setModalState }) {
  return (
    <>
      {modalState && (
        <div className=" w-screen h-screen fixed top-0 left-0 bg-black/50 z-20 flex justify-center items-center">
          <div className="bg-white p-4 w-10/12 h-2/6 rounded-lg shadow-2xl flex flex-col items-center">
            {children}
          </div>
        </div>
      )}
    </>
  );
}

export default Modal;
