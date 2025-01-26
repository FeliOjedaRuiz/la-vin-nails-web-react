import React, { useContext } from 'react';
import Layout from '../components/layouts/Layout';
import { AuthContext } from '../contexts/AuthStore';
import UsersSearchComponent from './../components/users/users-search-component/UsersSearchComponent';

function AdminPage() {
	const { logout } = useContext(AuthContext);

	return (
		<Layout>
			<div className="flex flex-col items-center ">
				<div className="w-full flex flex-col items-center bg-gradient-to-t from-pink-50/0 via-pink-100 to-pink-100/50">
					<button
						onClick={() => logout()}
						className="text-white bg-gradient-to-l m-3 from-pink-700 via-pink-500 to-pink-700 shadow hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded text-xs self-center px-2 py-1 text-center"
					>
						Cerrar sesión
					</button>
          <p className='text-center font-semibold text-pink-800 text-2xl animate-bounce mt-2'>¡TE AMAMOS MUCHO!</p>
          <p className='text-center font-semibold text-teal-700 text-lg animate-pulse'>Dino y Feli</p>
				</div>
				<UsersSearchComponent />
			</div>
		</Layout>
	);
}

export default AdminPage;
