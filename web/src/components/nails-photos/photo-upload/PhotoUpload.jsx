import { useState } from 'react';
import photosService from '../../../services/photos';
import CloseIcon from './../../icons/CloseIcon';

function PhotoUpload({ userId, onPhotoCreation, visible, changeVisibility }) {
	const [photoUrl, setPhotoUrl] = useState('');
	const [isUploading, setIsUploading] = useState(false);
	const [fileName, setFileName] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const handleFileUpload = async (e) => {
		if (!e.target.files || e.target.files.length === 0) return;

		const file = e.target.files[0];
		setFileName(file.name);
		setIsUploading(true);

		console.log('The file to be uploaded is: ', e.target.files[0]);

		const uploadData = new FormData();

		uploadData.append('photoUrl', file);

		try {
			const response = await photosService.upload(uploadData);
			setPhotoUrl(response.photoUrl);
		} catch (err) {
			console.error('Error while uploading the file: ', err);
		} finally {
			setIsUploading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!photoUrl) return;

		const photo = {
			photoUrl,
			user: userId,
		};

		setIsUploading(true);

		try {
			await photosService.create(photo);
			setSuccessMessage('¡Foto subida con éxito!');
			setPhotoUrl('');
			setFileName('');
		} catch (err) {
			console.error('Error while adding the new photo: ', err);
		} finally {
			setIsUploading(false);
			onPhotoCreation();
		}
	};

	const handleClick = () => {
		setSuccessMessage('');
		changeVisibility();
	}

	return (
		<>
			{visible && (
				<div className="p-8 overflow-scroll bg-gradient-to-b from-lime-100/95 to-pink-100/95 fixed top-0 left-0 z-20 h-full w-full flex items-center justify-center backdrop-blur-[3px]">
					<div className="w-full max-w-md max-h-full flex flex-col mx-auto p-2 ">
					<div onClick={changeVisibility}>
						<CloseIcon  className={'h-9 w-9 drop-shadow absolute top-4 right-4 text-pink-600'} />
						</div>
						<div>
							<h1 className="text-2xl text-center font-bold mb-4 text-pink-700">
								Agregar Nueva Foto
							</h1>
						</div>
						<div>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<label htmlFor="photo-upload" className="cursor-pointer">
										<div className="flex items-center justify-center w-full aspect-square px-4 transition bg-white border-2 border-pink-200 border-dashed rounded-xl appearance-none cursor-pointer hover:border-emerald-500 focus:outline-none">
											{photoUrl ? (
												<div className="relative w-full pb-[100%]">
													<img
														src={photoUrl}
														alt="Preview"
														className="absolute inset-0 w-full h-full object-cover rounded-md"
													/>
												</div>
											) : (
												<span className="text-xl text-pink-300 font-medium">
													{isUploading ? 'Subiendo...' : 'Cargar Foto'}
												</span>
											)}
										</div>
									</label>
									<input
										id="photo-upload"
										type="file"
										className="hidden"
										onChange={handleFileUpload}
									/>
								</div>
								<div className='h-8 text-center text-pink-700 overflow-hidden'>
									<p>{fileName}</p>
								</div>
								<button
									type="submit"
									className="w-full py-2 px-4 text-xl bg-teal-600 disabled:bg-white/30 disabled:text-pink-300/30 text-white rounded-md hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
									disabled={!photoUrl || isUploading}
								>
									Agregar Foto
								</button>
							</form>
							{successMessage && (
								<div className='bg-black/60 fixed top-0 left-0 z-20 h-screen w-screen flex items-center justify-center backdrop-blur-[3px] '>
								<div className='bg-white p-8 rounded-md flex flex-col items-center shadow-md'>
									<p className="text-emerald-600 text-2xl font-medium text-center mb-6">
										{successMessage}
									</p>
									<button onClick={handleClick} className='bg-teal-600 text-white text-xl font-medium rounded-md px-3 py-1 shadow-sm'>OK</button>
								</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default PhotoUpload;
