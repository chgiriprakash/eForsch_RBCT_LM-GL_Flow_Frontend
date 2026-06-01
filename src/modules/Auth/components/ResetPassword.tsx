import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import InputField from "../../../shared/components/InputField";
import Toast from "../../../shared/components/Toast";
import { resetPassword } from "../authSlice";

interface ResetPasswordProps {
  formConfig: any[];
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ formConfig }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ Get email from URL
  const email = searchParams.get("email");

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  /* ============================
     VALIDATE EMAIL ON LOAD
  ============================= */

  useEffect(() => {
    if (!email) {
      setToastMessage("Invalid reset request. Email not found.");
      setToastType("error");

      setTimeout(() => {
        navigate("/auth/forgot-password");
      }, 4000);

      setIsChecking(false);
      return;
    }

    setIsChecking(false);
  }, [email, navigate]);

  /* ============================
     FORM HANDLING
  ============================= */

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateField = (_id: string, value: any, validation: any) => {
    if (!validation) return "";

    if (validation.required && !value)
      return "This field is required.";

    if (validation.minLength && value?.length < validation.minLength)
      return `Minimum length is ${validation.minLength} characters.`;

    return "";
  };

  /* ============================
     SUBMIT
  ============================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    formConfig?.forEach(({ id, validation }) => {
      const error = validateField(id, formData[id], validation);
      if (error) newErrors[id] = error;
    });

    // ✅ Check password match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToastMessage("Please fix the errors before submitting.");
      setToastType("error");
      return;
    }

    try {
      await dispatch(
        resetPassword({
          email: email || "",
          newPassword: formData.password,
          confirmPassword: formData.confirmPassword,
        })
      ).unwrap();

      setToastMessage("Password reset successful. You can now login.");
      setToastType("success");
      setIsSubmitted(true);

      // ✅ Longer readable delay
      setTimeout(() => {
        navigate("/auth/login");
      }, 4000);

    } catch (error: any) {
      setToastMessage(
        error || "Password reset failed. Please try again."
      );
      setToastType("error");
    }
  };

  /* ============================
     UI
  ============================= */

  if (isChecking) {
    return (
      <div className="text-center mt-4">
        <p>Preparing password reset...</p>
      </div>
    );
  }

  return (
    <>
      {!isSubmitted ? (
        <form
          className="row g-2 align-items-center form"
          onSubmit={handleSubmit}
        >
          <h6 className="text-dark text-center">
            Reset Your Password
          </h6>

          <p className="text-center text-muted small">
            Please enter a new password for <b>{email}</b>
          </p>

          {formConfig?.map((field) => (
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
              Reset Password
            </button>

            <div className="links mt-2">
              <Link to="/auth/login">
                Back to Login
              </Link>
            </div>
          </div>
        </form>
      ) : (
        <div className="confirmation-screen text-center">
          <h6>Password Reset Successful</h6>
          <p className="text-success">
            Your password has been updated successfully.
            Redirecting to login...
          </p>
        </div>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={5000}   // ✅ longer readable toast
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
};

export default ResetPassword;