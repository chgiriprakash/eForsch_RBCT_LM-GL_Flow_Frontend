import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import InputField from "../../../shared/components/InputField";
import Toast from "../../../shared/components/Toast";
import { loginUser } from "../authSlice";
import { createProfile, getProfile } from "../../dashboard/dashboardSlice";

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

  formConfig.forEach(({ id, validation }) => {
    const error = validateField(id, formData[id], validation);

    if (error) {
      newErrors[id] = error;
    }
  });

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    alert("Please fill all required fields correctly.");
    return;
  }

  try {
    const credentials = {
      email: formData.email,
      password: formData.password,
    };

    const result = await dispatch(loginUser(credentials)).unwrap();

    console.log("LOGIN RESPONSE:", result);

    const user = result?.data?.user;

    try {
      const existingProfile = await dispatch(
        getProfile(user.id)
      ).unwrap();

      console.log("Profile exists:", existingProfile);

    } catch (error: any) {

      console.log("Profile not found. Creating profile...");

      // if (
      //   error?.code === 404 ||
      //   error?.message?.includes("Profile not found")
      // ) {

        const profilePayload = {
          userId: user?.id || "",
          email: user?.email || "",
          firstName: user?.name || "",
          secondName: "",
          title: "",
          role: user?.role || "",
          groupName: user?.groupName || "",
          status: user?.status || "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
          labName: "",
          roomNumber: "",
          buildingNumber: "",
          streetName: "",
        };

        try {
          await dispatch(
            createProfile(profilePayload)
          ).unwrap();

          console.log("Profile created successfully");

        } catch (profileError) {

          console.error(
            "Profile creation failed:",
            profileError
          );
        }
      // }
    }

    setToastMessage("Login successful!");
    setToastType("success");

    navigate("/dashboard");

  } catch (error) {

    console.error("Login failed:", error);

    setToastMessage(
      "Login failed. Please check your credentials."
    );

    setToastType("error");
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
            totalFields={formConfig.length}
          />
        ))}

        <div className="col-12 btnWrapper">
          <button type="submit" className="btn btn-color">
            Login
          </button>
          <div className="links mt-2">
            <Link to="/auth/register" className="me-3">
              New User Registration
            </Link>
            <Link to="/auth/forgot-password">
              Forgot Password?
            </Link>
          </div>
        </div>
      </form>

      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
};

export default LoginForm;