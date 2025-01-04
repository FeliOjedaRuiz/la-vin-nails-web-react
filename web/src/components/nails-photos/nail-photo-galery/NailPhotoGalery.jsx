import { useState, useEffect } from 'react';
import photosService from '../../../services/photos';
import PhotoItem from '../photo-item/PhotoItem';

function NailPhotoGalery({ userId, reload, changeVisibility }) {
	const [photos, setPhotos] = useState([]);

	useEffect(() => {
		photosService
			.listByUser(userId)
			.then((photos) => {
				setPhotos(photos.reverse());
			})
			.catch((error) => console.error(error));
	}, [userId, reload]);

	return (
		<div className="p-4 w-full">
			<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4 w-full">
				<button
					onClick={changeVisibility}
					className="aspect-square overflow-hidden object-center rounded-lg bg-pink-50/50 border border-pink-100/50 flex justify-center items-center shadow-md"
				>
					<p className="text-4xl text-pink-700">+</p>
				</button>
				{!photos[0] && (
					<div className="aspect-square overflow-hidden object-center rounded-lg bg-pink-50/50 border border-pink-100/50 flex justify-center items-center shadow-md"></div>
				)}
				{!photos[0] && (
					<div className="aspect-square overflow-hidden object-center rounded-lg bg-pink-50/50 border border-pink-100/50 flex justify-center items-center shadow-md"></div>
				)}
				{photos.map((photo) => (
					<PhotoItem photo={photo} key={photo.id} />
				))}
			</div>
		</div>
	);
}

export default NailPhotoGalery;
