import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import InputField from "../../../shared/components/InputField";
import Toast from "../../../shared/components/Toast";
import { forgotPassword } from "../authSlice";

interface ForgotPasswordProps {
  formConfig: any[];
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ formConfig }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSubmitted, setIsSubmitted] = useState(false);

  /* ============================
     FORM HANDLING
  ============================= */

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateField = (_id: string, value: any, validation: any) => {
    if (!validation) return "";

    if (validation.required && !value) return "This field is required.";
    if (validation.pattern && !validation.pattern.test(value))
      return "Invalid email format.";

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
      setToastMessage("Please fill all required fields correctly.");
      setToastType("error");
      return;
    }

    try {
      const result = await dispatch(
        forgotPassword({ email: formData.email })
      ).unwrap();

      navigate(`/auth/enter-otp?email=${formData.email}`);

      // Backend always returns generic success message
      setToastMessage(result.message);
      setToastType("success");
      setIsSubmitted(true);

    } catch (error: any) {
      setToastMessage(
        error || "Failed to send reset link. Please try again."
      );
      setToastType("error");
    }
  };

  /* ============================
     UI
  ============================= */

  return (
    <>
      {!isSubmitted ? (
        <form
          className="row g-2 align-items-center form"
          onSubmit={handleSubmit}
        >
          <h6 className="text-dark text-center">Forgot Password</h6>

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
              Submit
            </button>

            <div className="links mt-2">
              <span>Remembered your password? </span>
              <Link to="/auth/login">Click here to Login</Link>
            </div>
          </div>
        </form>
      ) : (
        <div className="confirmation-screen text-center">
          <h6>Check your email</h6>
          <p className="text-success">
            If the email is registered, an OTP has been sent.
          </p>
          <Link to="/auth/login">Back to Login</Link>
        </div>
      )}

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

export default ForgotPassword;