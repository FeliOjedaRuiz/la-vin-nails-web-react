import { useState, useEffect, useContext } from 'react';
import photosService from '../../../services/photos';
import PhotoItem from '../photo-item/PhotoItem';
import { AuthContext } from '../../../contexts/AuthStore';
import LeftIcon from './../../icons/LeftIcon';
import RightIcon from './../../icons/RightIcon';
import CloseIcon from '../../icons/CloseIcon';
import DeleteIcon from '../../icons/DeleteIcon';

function NailPhotoGalery({ userId, reload, changeVisibility }) {
	const [photos, setPhotos] = useState([]);
	const [hidden, setHidden] = useState(true);
	const [photoUrl, setPhotoUrl] = useState('');
	const [photoIndex, setPhotoIndex] = useState(0);
	const { user } = useContext(AuthContext);
	const [role, setRole] = useState('guest');
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (!user) {
			setRole('guest');
		} else {
			setRole(user.role);
		}
	}, [user]);

	const handleOpen = (photoIndex) => {
		console.log('click');
		setHidden(!hidden);
		setPhotoUrl(photos[photoIndex].photoUrl);
		setPhotoIndex(photoIndex);
	};

	const handleDeletePhoto = async (photoId) => {
		setIsDeleting(true);
		try {
			// Verificar si la foto que se va a eliminar es la que se está mostrando en el modal
			const photoToDelete = photos.find(photo => photo.id === photoId);
			const isCurrentPhotoInModal = !hidden && photoToDelete && photos[photoIndex]?.id === photoId;
			
			// Llamada al servicio para eliminar la foto
			await photosService.deletePhoto(photoId);
			
			// Actualizar la lista local de fotos
			setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
			
			// Si la foto eliminada era la que se estaba mostrando en el modal, cerrarlo
			if (isCurrentPhotoInModal) {
				setHidden(true);
				setPhotoUrl('');
				setPhotoIndex(0);
			}
			
			console.log('Foto eliminada exitosamente');
		} catch (error) {
			console.error('Error al eliminar la foto:', error);
			alert('Error al eliminar la foto. Por favor, inténtalo de nuevo.');
		} finally {
			setIsDeleting(false);
		}
	};

	const handleChangePhotoRigth = () => {
		if (photoIndex >= photos.length - 1) {
			setPhotoUrl(photos[0].photoUrl);
			setPhotoIndex(0);
		} else {
			setPhotoUrl(photos[photoIndex + 1].photoUrl);
			setPhotoIndex(photoIndex + 1);
		}
	};

	const handleChangePhotoLeft = () => {
		if (photoIndex <= 0) {
			setPhotoUrl(photos[photos.length - 1].photoUrl);
			setPhotoIndex(photos.length - 1);
		} else {
			setPhotoUrl(photos[photoIndex - 1].photoUrl);
			setPhotoIndex(photoIndex - 1);
		}
	};

	const handleClose = () => {
		setHidden(!hidden);
	};

	useEffect(() => {
		photosService
			.listByUser(userId)
			.then((photos) => {
				setPhotos(photos.reverse());
			})
			.catch((error) => console.error(error));
	}, [userId, reload]);

	return (
		<>
			{isDeleting && (
				<div className="fixed top-0 left-0 z-30 h-full w-full bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
					<div className="bg-white p-6 rounded-lg shadow-lg">
						<p className="text-lg font-medium text-gray-700">Eliminando foto...</p>
					</div>
				</div>
			)}
			
			<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4 w-full max-h-80 overflow-scroll p-2">
				{role === 'admin' && (
					<button
						onClick={changeVisibility}
						className="relative aspect-[3/4] overflow-hidden object-center rounded-lg bg-pink-50 flex justify-center items-center shadow-md"
					>
						<p className="absolute text-5xl text-pink-700">+</p>
					</button>
				)}

				{photos.map((photo, index) => (
					<PhotoItem
						photo={photo}
						key={photo.id}
						handleOpen={handleOpen}
						index={index}
						onDelete={handleDeletePhoto}
					/>
				))}

				{!photos[0] && (
					<img
						className="opacity-20 aspect-[3/4] grayscale w-full h-full object-cover rounded-lg shadow-md"
						src="https://res.cloudinary.com/duoshgr3h/image/upload/v1736036501/la-vin-nails-web/defaults/PhotoDefault_cbdvxx.webp"
						alt="Foto por defecto"
					/>
				)}

				{!photos[1] && (
					<img
						className="opacity-20 aspect-[3/4] grayscale w-full h-full object-cover rounded-lg shadow-md"
						src="https://res.cloudinary.com/duoshgr3h/image/upload/v1736036501/la-vin-nails-web/defaults/PhotoDefault_cbdvxx.webp"
						alt="Foto por defecto"
					/>
				)}

				{role !== 'admin' && !photos[2] && (
					<img
						className="opacity-20 aspect-[3/4] grayscale w-full h-full object-cover rounded-lg shadow-md"
						src="https://res.cloudinary.com/duoshgr3h/image/upload/v1736036501/la-vin-nails-web/defaults/PhotoDefault_cbdvxx.webp"
						alt="Foto por defecto"
					/>
				)}
			</div>
			{!hidden && (
				<div
					className="fixed p-5 md:p-7 xl:p-10 top-0 left-0 z-20 h-full w-full bg-gradient-to-b from-pink-100/80 to-lime-100/80 backdrop-blur-[3px]"
					hidden={hidden}
				>
					<div className="w-full h-full flex ">
						<div className="relative aspect-[3/4] m-auto max-h-full max-w-full ">
							<img
								className="object-cover aspect-[3/4] rounded-xl shadow-md "
								src={photoUrl}
								alt="Foto de manicura"
							/>
							<button
								onClick={handleClose}
								className="absolute top-3 right-3 font-bold text-3xl text-white"
							>
								<CloseIcon className={'h-9 w-9 drop-shadow'} />
							</button>
							
							{role === 'admin' && (
								<button
									onClick={() => {
										if (window.confirm('¿Estás segura de que quieres eliminar esta foto?')) {
											handleDeletePhoto(photos[photoIndex]?.id);
										}
									}}									
									className="absolute bottom-3 left-3 rounded-full flex items-center justify-center"
									title="Eliminar foto"
								>
									<DeleteIcon className={'h-6 w-6 text-white/60 drop-shadow'} />
								</button>
							)}
							
							<div>
								<button
									onClick={handleChangePhotoRigth}
									className="absolute top-1/2 left-3 font-bold text-pink-600 drop-shadow-xl"
								>
									<LeftIcon />
								</button>
								<button
									onClick={handleChangePhotoLeft}
									className="absolute top-1/2 right-3 font-bold text-pink-600 drop-shadow-xl"
								>
									<RightIcon />
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default NailPhotoGalery;