import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthRoutes } from '../modules/Auth';
import { DashboardRoutes } from '../modules/dashboard';
import ProtectedRoute from './ProtectedRoute';

const MainRoutes = () => (
  <Router>
    <Routes>
      {/* Redirect base path to welcome/login */}
      <Route path="/" element={<Navigate to="/auth" />} />

      {/* Auth routes */}
      <Route path="auth/*" element={<AuthRoutes />} />

      {/* Dashboard routes */}
      <Route path="/*" element={
          <ProtectedRoute>
            <DashboardRoutes />
          </ProtectedRoute>
        } />

      {/* Fallback for unknown paths */}
      <Route path="*" element={<Navigate to="/auth/login" />} />
    </Routes>
  </Router>
);

export default MainRoutes;
