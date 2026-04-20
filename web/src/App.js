import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Import directo para optimizar el primer render
import FullPageLoader from './components/loading/FullPageLoader';
import AuthStore from './contexts/AuthStore';
import PrivateRoute from './guards/PrivateRoute';
import UnlogedRoute from './guards/UnlogedRoute';

// Carga perezosa (Lazy Loading) de las demás páginas
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const SchedulePageAdmin = lazy(() => import('./pages/SchedulePageAdmin'));
const ClientProfilePage = lazy(() => import('./pages/ClientProfilePage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const TurnDetailPage = lazy(() => import('./pages/TurnDetailPage'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));
const NewDatePage = lazy(() => import('./pages/NewDatePage'));
const SchedulePageGuest = lazy(() => import('./pages/SchedulePageGuest'));
const RestorePasswordPage = lazy(() => import('./pages/RestorePasswordPage'));
const SendRestoreEmailPage = lazy(() => import('./pages/SendRestoreEmailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NewDateAdminPage = lazy(() => import('./pages/NewDateAdminPage'));
const AccountingPage = lazy(() => import('./pages/AccountingPage'));

function App() {
	return (
		<>
			<AuthStore>
				<Suspense fallback={<FullPageLoader />}>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/error-page" element={<ErrorPage />} />
						<Route path="/services" element={<ServicesPage />} />
						<Route
							path="/new-date/:id"
							element={
								<PrivateRoute>
									<NewDatePage />
								</PrivateRoute>
							}
						/>
						<Route
							path="/new-date-admin/:id"
							element={
								<PrivateRoute role="admin">
									<NewDateAdminPage />
								</PrivateRoute>
							}
						/>
						<Route
							path="/profile"
							element={
								<PrivateRoute>
									<ClientProfilePage />
								</PrivateRoute>
							}
						/>
						<Route path="/register" element={<RegisterPage />} />
						<Route path="/login" element={<LoginPage />} />

						<Route path="/restore" element={<SendRestoreEmailPage />} />

						<Route
							path="/restore/:userId"
							element={
								<UnlogedRoute>
									<RestorePasswordPage />
								</UnlogedRoute>
							}
						/>

						<Route path="/guest-schedule" element={<SchedulePageGuest />} />
						<Route
							path="/admin-schedule"
							element={
								<PrivateRoute role="admin">
									<SchedulePageAdmin />
								</PrivateRoute>
							}
						/>
						<Route
							path="/turns/:id"
							element={
								<PrivateRoute role="admin">
									<TurnDetailPage />
								</PrivateRoute>
							}
						/>
						<Route
							path="/users/:id"
							element={
								<PrivateRoute role="admin">
									<ProfilePage />
								</PrivateRoute>
							}
						/>
						<Route
							path="/admin"
							element={
								<PrivateRoute role="admin">
									<AdminPage />
								</PrivateRoute>
							}
						/>
						<Route
							path="/accounting"
							element={
								<PrivateRoute role="admin">
									<AccountingPage />
								</PrivateRoute>
							}
						/>
					</Routes>
				</Suspense>
			</AuthStore>
		</>
	);
}

export default App;
