import { useState, useEffect } from 'react';
import photosService from '../../../services/photos';
import PhotoItem from '../photo-item/PhotoItem';

function ClientNailPhotoGalery({ userId }) {
	const [photos, setPhotos] = useState([]);

	useEffect(() => {
		photosService
			.listByUser(userId)
			.then((photos) => {
				setPhotos(photos.reverse());
			})
			.catch((error) => console.error(error));
	}, [userId]);

	return (
		<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4 w-full max-h-56 overflow-scroll p-2">
			{photos.map((photo) => (
				<PhotoItem photo={photo} key={photo.id} />
			))}
			{!photos[0] && (
				<div className="aspect-square overflow-hidden object-center rounded-lg flex justify-center items-center shadow-md">
					<img
						className="opacity-20 grayscale"
						src="https://res.cloudinary.com/duoshgr3h/image/upload/v1736036501/la-vin-nails-web/defaults/PhotoDefault_cbdvxx.webp"
						alt="Foto por defecto"
					/>
				</div>
			)}
			{!photos[1] && (
				<div className="aspect-square overflow-hidden object-center rounded-lg flex justify-center items-center shadow-md">
					<img
						className="opacity-20 grayscale"
						src="https://res.cloudinary.com/duoshgr3h/image/upload/v1736036501/la-vin-nails-web/defaults/PhotoDefault_cbdvxx.webp"
						alt="Foto por defecto"
					/>
				</div>
			)}
			{!photos[2] && (
				<div className="aspect-square overflow-hidden object-center rounded-lg flex justify-center items-center shadow-md">
					<img
						className="opacity-20 grayscale"
						src="https://res.cloudinary.com/duoshgr3h/image/upload/v1736036501/la-vin-nails-web/defaults/PhotoDefault_cbdvxx.webp"
						alt="Foto por defecto"
					/>
				</div>
			)}
		</div>
	);
}

export default ClientNailPhotoGalery;
