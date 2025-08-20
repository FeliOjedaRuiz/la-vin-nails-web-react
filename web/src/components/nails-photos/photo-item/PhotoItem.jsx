import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthStore';
import DeleteIcon from '../../icons/DeleteIcon';

function PhotoItem({ photo, handleOpen, index, onDelete }) {
	const { user } = useContext(AuthContext);
	const isAdmin = user?.role === 'admin';

	function handleClick() {
		handleOpen(index);
	}

	function handleDeleteClick(e) {
		e.stopPropagation(); // Evita que se abra la imagen al hacer clic en eliminar
		if (window.confirm('¿Estás segura de que quieres eliminar esta foto?')) {
			onDelete(photo.id);
		}
	}
	
	return (
		<div
			onClick={handleClick}
			className="relative aspect-[3/4] overflow-hidden object-center rounded-lg shadow-md cursor-pointer"
		>
			<img 
				src={photo.photoUrl} 
				alt="Foto de manicura"
				className="w-full h-full object-cover"
			/>
			
			{isAdmin && (
				<button
					onClick={handleDeleteClick}
					className="absolute bottom-1 left-1 text-white rounded-full  flex items-center justify-center font-bold shadow-md transition-colors duration-200 opacity-90 hover:opacity-100"
					title="Eliminar foto"
				>
					<DeleteIcon className={'h-3 w-3 text-white/60 hover:text-white drop-shadow'} />
				</button>
			)}
		</div>
	);
}

export default PhotoItem;
