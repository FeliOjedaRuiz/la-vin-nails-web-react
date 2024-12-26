import { useState, useEffect } from 'react';
import photosService from '../../../services/photos';
import PhotoItem from '../photo-item/PhotoItem';

function NailPhotoGalery({ userId }) {
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
		<div className="p-4 w-full">
			<h2 className="mb-2 font-bold text-2xl lg:text-4xl text-emerald-600">
				Galeria
			</h2>

			<div className="grid grid-cols-3 gap-2 w-full">
				<div className="aspect-square overflow-hidden object-center rounded-lg bg-pink-50/50 border border-pink-100/50 flex justify-center items-center ">
					<p className='text-4xl text-pink-700'>+</p>
				</div>
        {!photos[0] && 
          <div className="aspect-square overflow-hidden object-center rounded-lg bg-pink-50/50 border border-pink-100/50 flex justify-center items-center ">
					
				</div>
        }
        {!photos[0] && 
          <div className="aspect-square overflow-hidden object-center rounded-lg bg-pink-50/50 border border-pink-100/50 flex justify-center items-center ">
					
				</div>
        }
				{photos.map((photo) => (
					<PhotoItem photo={photo} key={photo.id} />
				))}
			</div>
		</div>
	);
}

export default NailPhotoGalery;
