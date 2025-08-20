const Photo = require('../models/photo.model');
const cloudinary = require('cloudinary').v2;

const getPublicIdFromUrl = (photoUrl) => {
	try {
		console.log('=== DEBUG: Procesando URL ===');
		console.log('URL original:', photoUrl);
		
		const decodedUrl = decodeURIComponent(photoUrl);
		console.log('URL decodificada:', decodedUrl);
		
		const urlParts = decodedUrl.split('/');
		console.log('URL dividida en partes:', urlParts);
		
		const uploadIndex = urlParts.indexOf('upload');
		console.log('Índice de "upload":', uploadIndex);
		
		if (uploadIndex === -1) {
			console.warn('No se encontró "upload" en la URL:', photoUrl);
			return null;
		}
		
		// Saltar la versión (v1755702210) y tomar el resto
		let pathWithFile = urlParts.slice(uploadIndex + 2).join('/');
		console.log('Path con archivo después de version:', pathWithFile);
		
		// Remover la extensión del archivo
		const publicId = pathWithFile.replace(/\.[^/.]+$/, '');
		console.log('=== Public ID FINAL extraído:', publicId);
		console.log('=== FIN DEBUG ===');
		
		return publicId;
	} catch (error) {
		console.error('Error al extraer public_id:', error);
		return null;
	}
};

module.exports.upload = (req, res, next) => {
	if (!req.file) {
		next(new Error('No file uploaded!'));
		return;
	}
	res.json({ photoUrl: req.file.path });
};

module.exports.create = (req, res, next) => {
	Photo.create(req.body)
		.then((photo) => res.status(201).json(photo))
		.catch(next);
};

module.exports.listByUser = (req, res, next) => {
	const criterial = { user: req.params.userId };
	Photo.find(criterial)
		.then((photos) => res.json(photos))
		.catch(next);
};

module.exports.delete = async (req, res, next) => {
	try {
		const photo = req.photo;		
		if (!photo) {
			return res.status(404).json({ message: 'Foto no encontrada' });
		}

		console.log('=== INICIANDO ELIMINACIÓN ===');
		console.log('ID de foto:', photo._id);
		console.log('URL de foto:', photo.photoUrl);
		console.log('Cloudinary configurado:', !!cloudinary.config().cloud_name);

		const publicId = getPublicIdFromUrl(photo.photoUrl);
		
		if (publicId) {
			try {
				console.log('=== ELIMINANDO DE CLOUDINARY ===');
				console.log('Intentando eliminar public_id:', publicId);
				
				const cloudinaryResult = await cloudinary.uploader.destroy(publicId);
				
				console.log('=== RESULTADO COMPLETO DE CLOUDINARY ===');
				console.log(JSON.stringify(cloudinaryResult, null, 2));
				
				if (cloudinaryResult.result === 'ok') {
					console.log('✅ ÉXITO: Imagen eliminada de Cloudinary');
				} else if (cloudinaryResult.result === 'not found') {
					console.log('⚠️ ADVERTENCIA: Imagen no encontrada en Cloudinary (puede haber sido eliminada antes)');
				} else {
					console.log('❌ ERROR: Resultado inesperado de Cloudinary:', cloudinaryResult.result);
				}
				
			} catch (cloudinaryError) {
				console.error('❌ ERROR CRÍTICO al eliminar de Cloudinary:', cloudinaryError);
				console.error('Stack trace:', cloudinaryError.stack);
			}
		} else {
			console.error('❌ No se pudo extraer el public_id de:', photo.photoUrl);
		}

		console.log('=== ELIMINANDO DE BASE DE DATOS ===');
		const dbResult = await Photo.deleteOne({ _id: req.params.id });
		console.log('Resultado eliminación DB:', dbResult);
		
		console.log('✅ PROCESO COMPLETADO');
		res.status(204).send();
		
	} catch (error) {
		console.error('❌ ERROR GENERAL al eliminar la foto:', error);
		console.error('Stack trace:', error.stack);
		next(error);
	}
};