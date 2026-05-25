import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import InputField from "../../../shared/components/InputField";
import Toast from "../../../shared/components/Toast";
import { loginUser } from "../authSlice";

const LoginForm: React.FC<{ formConfig: any[] }> = ({ formConfig }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateField = (_id: string, value: any, validation: any) => {
    if (!validation) return "";

    if (validation.required && !value) return "This field is required.";
    if (validation.minLength && value.length < validation.minLength)
      return `Minimum length is ${validation.minLength} characters.`;
    if (validation.pattern && !validation.pattern.test(value))
      return "Invalid format.";

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // ✅ Validate fields before submitting
    formConfig.forEach(({ id, validation }) => {
      const error = validateField(id, formData[id], validation);
      if (error) newErrors[id] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.warn("Validation failed:", newErrors);
      alert("Please fill all required fields correctly.");
      return;
    }

    try {
      console.log("Submitting login form:", formData);
      const credentials = {
        email: formData.email,
        password: formData.password,
      };
      const result = await dispatch(loginUser(credentials)); // API call to login
      console.log("API Response:", result);

      if (
        result &&
        result.payload &&
        typeof result.payload === "object" &&
        "data" in result.payload
      ) {
        console.log("Login successful! Navigating to Dashboard...");
        // alert("Login successful!");
        setToastMessage("Login successful!");
        setToastType("success");

        navigate("/dashboard"); // ✅ Redirect to dashboard on success
      } else {
        console.warn("Login failed. Invalid credentials.");
        alert("Login failed. Please check your credentials.");
        setToastMessage("Login failed. Please check your credentials.");
        setToastType("error");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Session expired or invalid user. Redirecting to login.");
      setToastMessage("Session expired or invalid user.");
      setToastType("error");
      navigate("/auth/login"); // ✅ Redirect to login if session is expired or invalid user
    }
  };

  return (
    <>
      <form className="row g-2 align-items-center form" onSubmit={handleSubmit}>
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
          />
        ))}

        <div className="col-12 btnWrapper">
          <button type="submit" className="btn btn-color">
            Login
          </button>
          <Link to="/auth/register">New User Registration</Link>
        </div>
      </form>

      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
};

export default LoginForm;