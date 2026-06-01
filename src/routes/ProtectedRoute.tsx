import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const auth = useSelector((state: any) => state.auth);
  const reduxUser = auth?.user;

  const user = useMemo(() => {
    if (reduxUser) return reduxUser;

    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }, [reduxUser]);

  const status = user?.status?.toLowerCase();
  const role = user?.role?.toLowerCase();

  const isUserApproved = status === 'approved';
  const isUserRejected = status === 'rejected' || status === 'denied';

  // 🔐 Not logged in
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // ❌ Rejected users (always blocked)
  if (isUserRejected) {
    return <Navigate to="/auth/rejected" replace />;
  }

  // ⏳ ONLY scientist needs approval
  if (role === 'scientist' && !isUserApproved) {
    return <Navigate to="/auth/waiting-approval" replace />;
  }

  // 🚫 Role-based restriction
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;