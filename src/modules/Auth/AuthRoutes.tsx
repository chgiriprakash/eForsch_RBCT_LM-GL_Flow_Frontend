import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import WelcomePage from './pages/WelcomePage';
import Unauthorized from './components/Unauthorized';
import registrationFormConfig from './../../shared/config/registrationFormConfig';
import loginFormConfig from './../../shared/config/loginFormConfig';
import WaitingApproval from './components/WaitingApproval';
import UserRejected from './components/UserRejected';

const AuthRoutes = () => (
  <Routes>
    <Route path="/" element={<WelcomePage />}>
      <Route index element={<Navigate to="login" />} />
      <Route path="login" element={<LoginForm formConfig={loginFormConfig} />} />
      <Route path="register" element={<RegisterForm formConfig={registrationFormConfig} />} />
      <Route path="waiting-approval" element={<WaitingApproval />} />
      <Route path="rejected" element={<UserRejected />} />
      <Route path="unauthorized" element={<Unauthorized />} />
    </Route>
  </Routes>
);

export default AuthRoutes;
