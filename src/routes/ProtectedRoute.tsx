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
  console.log("ProtectedRoute - reduxUser:", reduxUser);
  const isAuthenticated = auth?.isAuthenticated;

  const user = useMemo(() => {
    if (reduxUser) return reduxUser;

    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }, [reduxUser]);

  const isUserApproved = user?.status === 'Approved' || user?.status === 'approved';
  const isUserRejected = user?.status === 'Rejected' || user?.status === 'rejected' || user?.status === "denied" || user?.status === "Denied";

  console.log('ProtectedRoute: user =', user);
  console.log('ProtectedRoute: isAuthenticated =', isAuthenticated);
  console.log('ProtectedRoute: isUserApproved =', isUserApproved);
  console.log('ProtectedRoute: isUserRejected =', isUserRejected);
  console.log('ProtectedRoute: allowedRoles =', allowedRoles);

  if (!isAuthenticated && !user) {
    return <Navigate to="/auth/login" />;
  }

  if (isUserRejected) {
    return <Navigate to="/auth/rejected" />;
  }

  if (!isUserApproved) {
    return <Navigate to="/auth/waiting-approval" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
