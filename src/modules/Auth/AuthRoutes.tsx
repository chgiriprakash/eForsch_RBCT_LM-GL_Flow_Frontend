import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword'
import WelcomePage from './pages/WelcomePage';
import Unauthorized from './components/Unauthorized';
import registrationFormConfig from './../../shared/config/registrationFormConfig';
import forgotPasswordConfig from './../../shared/config/forgotPasswordConfig';
import resetPasswordConfig from './../../shared/config/resetPasswordConfig';
import loginFormConfig from './../../shared/config/loginFormConfig';
import WaitingApproval from './components/WaitingApproval';
import UserRejected from './components/UserRejected';
import otpFormConfig from './../../shared/config/otpFormConfig';
import EnterOtp from './components/EnterOtp';

const AuthRoutes = () => (
  <Routes>
    <Route path="/" element={<WelcomePage />}>
      <Route index element={<Navigate to="login" />} />
      <Route path="login" element={<LoginForm formConfig={loginFormConfig} />} />
      <Route path="register" element={<RegisterForm formConfig={registrationFormConfig} />} />
      <Route path="forgot-password" element={<ForgotPassword formConfig={forgotPasswordConfig} />} />
      <Route path="reset-password" element={<ResetPassword formConfig={resetPasswordConfig} />} /> 
      <Route path="enter-otp" element={<EnterOtp formConfig={otpFormConfig} />} />
      <Route path="waiting-approval" element={<WaitingApproval />} />
      <Route path="rejected" element={<UserRejected />} />
      <Route path="unauthorized" element={<Unauthorized />} />
    </Route>
  </Routes>
);

export default AuthRoutes;
