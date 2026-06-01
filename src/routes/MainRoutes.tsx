import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthRoutes } from "../modules/Auth";
// import ResetPassword from "../modules/Auth/components/ResetPassword";
import { DashboardRoutes } from "../modules/dashboard";
import ProtectedRoute from "./ProtectedRoute";

const MainRoutes = () => (
  <Router>
    <Routes>
      {/* Redirect base path */}
      <Route path="/" element={<Navigate to="/auth" />} />

      {/* PUBLIC routes */}
      <Route path="auth/*" element={<AuthRoutes />} />
      {/* <Route path="/reset-password" element={<ResetPassword />} /> */}

      {/* PROTECTED routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardRoutes />
          </ProtectedRoute>
        }
      /> 

      {/* Fallback */} 
      <Route path="*" element={<Navigate to="/auth/login" />} />
    </Routes>
  </Router>
);

export default MainRoutes;
