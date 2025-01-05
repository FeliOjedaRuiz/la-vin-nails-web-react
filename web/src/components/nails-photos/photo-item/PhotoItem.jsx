function PhotoItem({ photo, handleOpen, index }) {
	function handleClick() {
		handleOpen(index);
	}
	
	return (
		<div
			onClick={handleClick}
			className="aspect-[3/4] overflow-hidden object-center rounded-lg shadow-md "
		>
			<img src={photo.photoUrl} alt="Foto de manicura" />
		</div>
	);
}

export default PhotoItem;
