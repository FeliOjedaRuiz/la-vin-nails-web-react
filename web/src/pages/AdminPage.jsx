import React, { useContext } from 'react';
import Layout from '../components/layouts/Layout';
import { AuthContext } from '../contexts/AuthStore';
import UsersSearchComponent from './../components/users/users-search-component/UsersSearchComponent';
import PwaStatusCard from '../components/pwa/PwaStatusCard';
import PushSettingsCard from '../components/pwa/PushSettingsCard';
import RegistrationToggle from '../components/settings/registration-toggle/RegistrationToggle';
import usePwaStatus from '../hooks/usePwaStatus';

function AdminPage() {
	const { logout } = useContext(AuthContext);
	const {
		swStatus,
		isDevMode,
		checkForUpdate,
		isCheckingUpdate,
		pushSupported,
		pushPermission,
		isSubscribed,
		isTogglingPush,
		togglePush,
		sendTestNotification,
		isSendingTest,
		testResult,
	} = usePwaStatus();

	return (
		<Layout>
			<div className="flex flex-col items-center w-full">

				{/* Page header */}
				<div className="w-full bg-gradient-to-b from-pink-100/80 to-pink-50/0 px-4 pt-6 pb-4">
					<h1 className="text-2xl font-bold text-pink-800 text-center tracking-tight">
						Panel de Administración
					</h1>
					<p className="text-sm text-pink-400 text-center mt-1">
						Configuración y control de la aplicación
					</p>
				</div>

				{/* PWA Controls */}
				<div className="w-full max-w-md px-4 flex flex-col gap-4 mt-2">

					<PwaStatusCard
						swStatus={swStatus}
						isDevMode={isDevMode}
						checkForUpdate={checkForUpdate}
						isCheckingUpdate={isCheckingUpdate}
					/>

					<PushSettingsCard
						pushSupported={pushSupported}
						pushPermission={pushPermission}
						isSubscribed={isSubscribed}
						isTogglingPush={isTogglingPush}
						togglePush={togglePush}
						sendTestNotification={sendTestNotification}
						isSendingTest={isSendingTest}
						testResult={testResult}
						isDevMode={isDevMode}
					/>

					<RegistrationToggle />
				</div>

				{/* Divider */}
				<div className="w-full max-w-md px-4 mt-6 mb-2">
					<div className="flex items-center gap-3">
						<div className="flex-1 h-px bg-pink-100" />
						<span className="text-xs font-medium text-pink-300 shrink-0">CLIENTAS</span>
						<div className="flex-1 h-px bg-pink-100" />
					</div>
				</div>

				{/* Users search */}
				<div className="w-full">
					<UsersSearchComponent />
				</div>

				{/* Logout */}
				<div className="w-full max-w-md px-4 py-6">
					<button
						onClick={() => logout()}
						className="w-full py-2.5 rounded-xl text-sm font-medium
							border border-pink-200 text-pink-500
							hover:bg-pink-50 active:scale-[0.98]
							transition-all duration-200"
					>
						Cerrar sesión
					</button>
				</div>

			</div>
		</Layout>
	);
}

export default AdminPage;
