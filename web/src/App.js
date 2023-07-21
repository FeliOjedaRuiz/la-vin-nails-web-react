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

function App() {
  return (
    <>
      <AuthStore>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/schedule" element={<PrivateRoute><SchedulePage /></PrivateRoute>} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/turns" element={<PrivateRoute role="admin"><TurnDetailPage /></PrivateRoute>} />
        </Routes>
      </AuthStore>      
    </>
  );
}

export default App;
