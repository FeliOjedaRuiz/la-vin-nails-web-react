import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import SchedulePageAdmin from "./pages/SchedulePageAdmin";
import ClientProfilePage from "./pages/ClientProfilePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AuthStore from "./contexts/AuthStore";
import PrivateRoute from "./guards/PrivateRoute";
import TurnDetailPage from "./pages/TurnDetailPage";
import ErrorPage from "./pages/ErrorPage";
import NewDatePage from "./pages/NewDatePage";
import SchedulePageGuest from "./pages/SchedulePageGuest";
import RestorePasswordPage from "./pages/RestorePasswordPage";
import SendRestoreEmailPage from "./pages/SendRestoreEmailPage";
import UnlogedRoute from "./guards/UnlogedRoute";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NewDateAdminPage from "./pages/NewDateAdminPage";

function App() {
  return (
    <>
      <AuthStore>
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
        </Routes>
      </AuthStore>
    </>
  );
}

export default App;
