import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import SchedulePage from "./pages/SchedulePage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AuthStore from "./contexts/AuthStore";
import PrivateRoute from "./guards/PrivateRoute";
import TurnDetailPage from "./pages/TurnDetailPage";
import ErrorPage from "./pages/ErrorPage";
import NewDatePage from "./pages/NewDatePage";
import SchedulePageGuest from "./pages/SchedulePageGuest";

function App() {
  return (
    <>
      <AuthStore>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/error-page" element={<ErrorPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/new-date/:id" element={<PrivateRoute><NewDatePage /></PrivateRoute>} />          
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/my-schedule" element={<PrivateRoute  role="guest"><SchedulePageGuest /></PrivateRoute>} />
          <Route path="/schedule" element={<PrivateRoute  role="admin"><SchedulePage /></PrivateRoute>} />
          <Route path="/turns/:id" element={<PrivateRoute role="admin"><TurnDetailPage /></PrivateRoute>} />
        </Routes>
      </AuthStore>      
    </>
  );
}

export default App;
