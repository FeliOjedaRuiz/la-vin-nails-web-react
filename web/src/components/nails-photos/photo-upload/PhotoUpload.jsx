import { useState } from 'react';
import photosService from '../../../services/photos';

function PhotoUpload({ userId }) {
	const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


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
      console.error("Error while uploading the file: ", err);
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
      setSuccessMessage("¡Foto subida con éxito!");
      setPhotoUrl("");
      setFileName("");
    } catch (err) {
      console.error("Error while adding the new photo: ", err);
    } finally {
      setIsUploading(false);
    }
  };

	return (
		<div className="w-full max-w-md mx-auto p-2">
      <div>
        <h1 className="text-2xl text-center font-bold mb-4 text-pink-700">Agregar Nueva Foto</h1>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="flex items-center justify-center w-full aspect-square px-4 transition bg-white border-2 border-pink-200 border-dashed rounded-md appearance-none cursor-pointer hover:border-emerald-500 focus:outline-none">
                {photoUrl ? (
                  <div className="relative w-full pb-[100%]">
                    <img 
                      src={photoUrl} 
                      alt="Preview" 
                      className="absolute inset-0 w-full h-full object-cover rounded-md" 
                    />
                  </div>
                ) : (
                  <span className='text-xl text-pink-300 font-medium'>{isUploading ? 'Subiendo...' : 'Cargar Foto'}</span>
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
          <button 
            type="submit" 
            className="w-full py-2 px-4 text-xl bg-pink-600 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            disabled={!photoUrl || isUploading}
          >
            Agregar Foto
          </button>
          {successMessage && !fileName && <p className="text-emerald-500 text-xl font-medium text-center">{successMessage}</p>}
        </form>
      </div>
    </div>
	);
}

export default PhotoUpload;
