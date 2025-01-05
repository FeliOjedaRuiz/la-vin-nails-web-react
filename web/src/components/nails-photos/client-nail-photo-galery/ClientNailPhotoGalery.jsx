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
				<img
					className="opacity-20 grayscale w-full h-full object-cover rounded-lg shadow-md"
					src="https://res.cloudinary.com/duoshgr3h/image/upload/v1736036501/la-vin-nails-web/defaults/PhotoDefault_cbdvxx.webp"
					alt="Foto por defecto"
				/>
			)}

			{!photos[1] && (
				<img
					className="opacity-20 grayscale w-full h-full object-cover rounded-lg shadow-md"
					src="https://res.cloudinary.com/duoshgr3h/image/upload/v1736036501/la-vin-nails-web/defaults/PhotoDefault_cbdvxx.webp"
					alt="Foto por defecto"
				/>
			)}

			{!photos[2] && (
				<img
					className="opacity-20 grayscale w-full h-full object-cover rounded-lg shadow-md"
					src="https://res.cloudinary.com/duoshgr3h/image/upload/v1736036501/la-vin-nails-web/defaults/PhotoDefault_cbdvxx.webp"
					alt="Foto por defecto"
				/>
			)}
		</div>
	);
}

export default ClientNailPhotoGalery;
