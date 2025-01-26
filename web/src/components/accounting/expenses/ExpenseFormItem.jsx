import React, { useState } from 'react';
import CloseIcon from '../../icons/CloseIcon';

function ExpenseFormItem() {
  const [openForm, setOpenForm] = useState(false);

  const changeOpenForm =  () => {
    setOpenForm(true)
  }


	return (
		<div>
			<div>
				<button
					onClick={changeOpenForm}
					className="relative aspect-[3/4] overflow-hidden object-center rounded-lg bg-pink-50 flex justify-center items-center shadow-md"
				>
					<p className="absolute text-5xl text-pink-700">+</p>
				</button>
			</div>
			<div>
      {openForm && (
				<div className="p-8 overflow-scroll bg-gradient-to-b from-lime-100/95 to-pink-100/95 fixed top-0 left-0 z-20 h-full w-full flex items-center justify-center backdrop-blur-[3px]">
					<div className="w-full max-w-md max-h-full flex flex-col mx-auto p-2 ">
					<div onClick={changeOpenForm}>
						<CloseIcon  className={'h-9 w-9 drop-shadow absolute top-4 right-4 text-pink-600'} />
						</div>
						<div>
							<h1 className="text-2xl text-center font-bold mb-4 text-pink-700">
								Agregar nuevo egreso:
							</h1>
						</div>
						<div>
							<form  className="space-y-4">
								
								
								<button
									type="submit"
									className="w-full py-2 px-4 text-xl bg-teal-600 disabled:bg-white/30 disabled:text-pink-300/30 text-white rounded-md hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
								>
									Agregar egreso
								</button>
							</form>
							{/* {successMessage && (
								<div className='bg-black/60 fixed top-0 left-0 z-20 h-screen w-screen flex items-center justify-center backdrop-blur-[3px] '>
								<div className='bg-white p-8 rounded-md flex flex-col items-center shadow-md'>
									<p className="text-emerald-600 text-2xl font-medium text-center mb-6">
										{successMessage}
									</p>
									<button onClick={handleClick} className='bg-teal-600 text-white text-xl font-medium rounded-md px-3 py-1 shadow-sm'>OK</button>
								</div>
								</div>
							)} */}
						</div>
					</div>
				</div>
			)}
      </div>
		</div>
	);
}

export default ExpenseFormItem;
