import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import InputField from "../../../shared/components/InputField";
import Toast from "../../../shared/components/Toast";
import { enterOtp, resendOtp } from "../authSlice";

interface EnterOtpProps {
  formConfig: any[];
}

const EnterOtp: React.FC<EnterOtpProps> = ({ formConfig }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateField = (_id: string, value: any, validation: any) => {
    if (!validation) return "";

    if (validation.required && !value) return "This field is required.";
    if (validation.minLength && value.length < validation.minLength)
      return `Minimum length is ${validation.minLength}`;

    return "";
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const newErrors: Record<string, string> = {};

  formConfig.forEach(({ id, validation }) => {
    const error = validateField(id, formData[id], validation);
    if (error) newErrors[id] = error;
  });

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    setToastMessage("Please enter a valid OTP.");
    setToastType("error");
    return;
  }

  try {
    const otp = formData.otp;

    const result = await dispatch(
      enterOtp({
        email: email || "",
        otp: otp,
      })
    ).unwrap();

    // ✅ ONLY proceed if success
    if (result?.status === "SUCCESS") {
      setToastMessage(result.message || "OTP verified successfully");
      setToastType("success");

      setTimeout(() => {
        navigate(`/auth/reset-password?email=${email}`, { replace: true });
      }, 1000);
    } else {
      setToastMessage(result?.message || "Invalid OTP. Please try again.");
      setToastType("error");
    }

  } catch (error: any) {
    setToastMessage(error || "Invalid OTP. Please try again.");
    setToastType("error");
  }
};

// ======================
  // RESEND OTP
  // ======================
  const handleResendOtp = async () => {
    try {
      const result = await dispatch(
        resendOtp({ email: email || "" })
      ).unwrap();
      
      if (result?.status === "SUCCESS") {
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


  return (
    <>
      <form className="row g-2 align-items-center form" onSubmit={handleSubmit}>
        <h6 className="text-dark text-center">We’ve sent a One-Time Password (OTP) to your email. <br/>
Please check your inbox and enter the code below to verify your account.</h6>

        {formConfig.map((field) => (
          <InputField
            key={field.id}
            id={field.id}
            label={field.label}
            type={field.type}
            value={formData[field.id] || ""}
            options={field.options}
            validation={field.validation}
            error={errors[field.id]}
            onChange={handleChange}
            isLoggedIn={false}
            totalFields={formConfig.length}
          />
        ))}

        <div className="col-12 btnWrapper">
          <button type="submit" className="btn btn-color">
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
      </form>
      
      {/* <p className="text-dark">Didn’t receive the email? Check your spam folder.</p> */}

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

export default EnterOtp;