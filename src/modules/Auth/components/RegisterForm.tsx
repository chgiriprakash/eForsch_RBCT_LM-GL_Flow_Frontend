import { useState, useEffect } from "react";
import InputField from "../../../shared/components/InputField";
import { Link, useNavigate } from "react-router-dom";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import {
  registerUser,
  getGroupNames,
  getRoles,
  sendOtp,
  validateOTP,
  resendOTPForEmail,
} from "../authSlice";
import Toast from "../../../shared/components/Toast";
import { validateField } from "../../../shared/utils/validation";
import { Button } from "react-bootstrap";
import otpFormConfig from "../../../shared/config/otpFormConfig";
import Modal from "../../../shared/components/Modal";

const RegisterForm: React.FC<{ formConfig: any[] }> = ({ formConfig }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); 
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [groupOptions, setGroupOptions] = useState<{}[]>([]);
  const [dynamicFormConfig, setDynamicFormConfig] = useState<any[]>(formConfig);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpData, setOtpData] = useState<any>({});
  const [otpErrors] = useState<any>({});

  // ======================
  // Handle Change
  // ======================
  const handleChange = (id: string, value: any) => {
    setFormData((prev) => {
      let updated = { ...prev, [id]: value };

      if (id === "role") {
        delete updated.groupName;
        if (value === "scientist") fetchGroupNames();
      }

      if (id === "email") {
        setIsEmailVerified(false);
      }

      return updated;
    });
  };

  const handleOtpChange = (id: string, value: any) => {
    setOtpData((prev: any) => ({ ...prev, [id]: value }));
  };

  // ======================
  // Fetch Roles
  // ======================
  const fetchRoles = async () => {
    try {
      const result = await dispatch(getRoles()).unwrap();
      const roleNames = result.roles.map((r: any) => ({
        key: r.key,
        label: r.label,
      }));

      const updatedConfig = formConfig.map((f) =>
        f.id === "role" ? { ...f, options: roleNames } : f
      );

      setDynamicFormConfig(updatedConfig);
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // Fetch Groups
  // ======================
  const fetchGroupNames = async () => {
    try {
      const result = await dispatch(getGroupNames()).unwrap();
      setGroupOptions(result.map((g: any) => g.groupName));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // ======================
  // SEND OTP
  // ======================
  const handleVerifyEmail = async () => {
    if (!formData.email) {
      setToastMessage("Enter email first");
      setToastType("error");
      return;
    }

    try {
      const result = await dispatch(sendOtp({ email: formData.email })).unwrap();

      if (result?.status === "success") {
        setToastMessage("OTP sent");
        setToastType("success");
        setShowOtpModal(true);
      } else {
        setToastMessage(result?.message || "Failed to send OTP");
        setToastType("error");
      }
    } catch (err: any) {
      setToastMessage(err || "Failed to send OTP");
      setToastType("error");
    }
  };

  // ======================
  // VERIFY OTP
  // ======================
  const handleVerifyOtp = async () => {
    try {
      const result = await dispatch(
        validateOTP({
          email: formData.email,
          otp: otpData.otp,
        })
      ).unwrap();

      if (result?.status === "success") {
        setIsEmailVerified(true);
        setShowOtpModal(false);
        setToastMessage("Email verified ✅");
        setToastType("success");
      } else {
        setToastMessage(result?.message || "Invalid OTP");
        setToastType("error");
      }
    } catch (err: any) {
      setToastMessage(err || "Invalid OTP");
      setToastType("error");
    }
  };

  // ======================
  // RESEND OTP
  // ======================
  const handleResendOtp = async () => {
    try {
      const result = await dispatch(
        resendOTPForEmail({ email: formData.email })
      ).unwrap();

      if (result?.status === "success") {
        setToastMessage("OTP resent");
        setToastType("success");
      } else {
        setToastMessage(result?.message || "Failed to resend OTP");
        setToastType("error");
      }
    } catch (err: any) {
      setToastMessage(err || "Failed to resend OTP");
      setToastType("error");
    }
  };

  // ======================
  // SUBMIT
  // ======================
 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailVerified) {
      setToastMessage("Please verify email first");
      setToastType("error");
      return;
    }

    const newErrors: Record<string, string> = {};
    const role = formData.role?.toLowerCase();

    dynamicFormConfig.forEach(({ id, validation }) => {
      if (id === "verifyEmail") return;

      if (id === "groupName" && role !== "scientist") return;

      const error = validateField(id, formData[id], validation);
      if (error) newErrors[id] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToastMessage("Please fix the errors before submitting.");
      setToastType("error");
      return;
    }

    try {
      const payload = { ...formData };

      // 🔥 ROLE-BASED STATUS
      if (role === "scientist") {
        payload.status = "pending";
      } else {
        payload.status = "approved";
      }

      // 🔥 GROUP NAME LOGIC (NEW FIX)
      if (role === "podept" || role === "labmgmt") {
        payload.groupName = "";
      } 
      else if (role === "groupleader") {
        payload.groupName = formData.groupName
          ? formData.groupName
          : `${formData.fname || ""}Group`.trim();
      } 
      else if (role === "scientist") {
        payload.groupName = formData.groupName;
      }

      const result = await dispatch(registerUser(payload)).unwrap();

      if (result?.status === "success") {
        setToastMessage("Registration successful");
        setToastType("success");

        if (role === "scientist") {
          navigate("/auth/waiting-approval", { replace: true });
        } else {
          navigate("/auth/login", { replace: true });
        }
      } else {
        setToastMessage("Registration failed");
        setToastType("error");
      }
    } catch (err: any) {
      setToastMessage(err || "Registration failed");
      setToastType("error");
    }
  };


  return (
    <>
      <form className="row g-2 form" onSubmit={handleSubmit}>
        {dynamicFormConfig.map((field) => {
          if (field.id === "groupName" && formData.role !== "scientist") {
            return null;
          }

         if (field.id === "email") {
            return (
              <div key="email" className="row align-items-end g-0">

                {/* Email Input */}
                <InputField
                  id={field.id}
                  label={field.label}
                  type={field.type}
                  value={formData[field.id] || ""}
                  validation={field.validation}
                  error={errors[field.id]}
                  onChange={handleChange}
                  isLoggedIn={false}
                  totalFields={dynamicFormConfig.length}
                  colSize="col-9" 
                />

                {/* Verify Button */}
                <div className="col-3 d-flex align-items-end">
                  <Button
                    className="w-100"
                    variant={isEmailVerified ? "success" : "btn-color"}
                    onClick={handleVerifyEmail}
                    disabled={isEmailVerified}
                  >
                    {isEmailVerified ? "Email Verified" : "Verify Email"}
                  </Button>
                </div>

              </div>
            );
          }

          if (field.id === "verifyEmail") return null;

          return (
            <InputField
              key={field.id}
              id={field.id}
              label={field.label}
              type={field.type}
              value={formData[field.id] || ""}
              options={
                field.id === "groupName"
                  ? groupOptions
                  : field.options
              }
              validation={field.validation}
              error={errors[field.id]}
              onChange={handleChange}
              isLoggedIn={false}
              totalFields={dynamicFormConfig.length}
            />
          );
        })}

        <div className="col-12 btnWrapper">
          <button
            type="submit"
            className="btn btn-color"
            disabled={!isEmailVerified}
          >
            Register
          </button>
          <Link to="/auth/login">Already have an account?</Link>
        </div>
      </form>

      {/* OTP MODAL */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Verify Email"
      >
        {otpFormConfig.map((field) => (
          <InputField
            key={field.id}
            id={field.id}
            label={field.label}
            type={field.type}
            value={otpData[field.id] || ""}
            validation={field.validation}
            error={otpErrors[field.id]}
            onChange={handleOtpChange}
            isLoggedIn={false}
            totalFields={1}
          />
        ))}

        <div className="col-12 btnWrapper mt-3">
          <button
            type="button"
            className="btn btn-color"
            onClick={handleVerifyOtp}
          >
            Verify OTP
          </button>

          <button
            type="button"
            className="btn btn-link"
            onClick={handleResendOtp}
          >
            Resend OTP
          </button>
        </div>
      </Modal>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
};

export default RegisterForm;