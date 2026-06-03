import React, { useContext, useState } from 'react';
import Layout from '../components/layouts/Layout';
import { AuthContext } from '../contexts/AuthStore';
import UsersSearchComponent from './../components/users/users-search-component/UsersSearchComponent';
import PwaStatusCard from '../components/pwa/PwaStatusCard';
import PushSettingsCard from '../components/pwa/PushSettingsCard';
import RegistrationToggle from '../components/settings/registration-toggle/RegistrationToggle';
import usePwaStatus from '../hooks/usePwaStatus';

function AccordionItem({ title, icon, children, defaultOpen = false }) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="border border-pink-100 rounded-2xl overflow-hidden bg-white">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-pink-50/50 transition-colors"
			>
				<div className="flex items-center gap-2.5">
					<span className="text-lg">{icon}</span>
					<span className="font-semibold text-pink-800 text-sm">{title}</span>
				</div>
				<svg
					className={`w-5 h-5 text-pink-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			<div
				className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
			>
				<div className="p-4 border-t border-pink-50">
					{children}
				</div>
			</div>
		</div>
	);
}

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

				{/* Accordions */}
				<div className="w-full max-w-md px-4 flex flex-col gap-3 mt-2">

					<AccordionItem title="Configuraciones" icon="⚙️" defaultOpen={true}>
						<div className="flex flex-col gap-4">
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
					</AccordionItem>

					<AccordionItem title="Listado de Clientas" icon="👥" defaultOpen={false}>
						<UsersSearchComponent />
					</AccordionItem>
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
