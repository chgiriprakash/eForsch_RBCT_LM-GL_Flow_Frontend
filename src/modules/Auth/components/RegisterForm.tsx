import { useState, useEffect } from "react";
import InputField from "../../../shared/components/InputField";
import { Link, useNavigate } from "react-router-dom";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { registerUser, getGroupNames, getRoles } from "../authSlice";
import Toast from "../../../shared/components/Toast";
import { validateField } from "../../../shared/utils/validation";

const RegisterForm: React.FC<{ formConfig: any[] }> = ({ formConfig }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [groupOptions, setGroupOptions] = useState<{}[]>([]);
  const [roleOptions, setRoleOptions] = useState<{}[]>([]);
  console.log("RegisterForm - roleOptions state:", roleOptions);
  const [dynamicFormConfig, setDynamicFormConfig] = useState<any[]>(formConfig);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // ✅ Handle input field changes
  const handleChange = (id: string, value: any) => {
    setFormData((prev) => {
      let updatedData = { ...prev, [id]: value };
      console.log("RegisterForm - handleChange - updatedData:", updatedData);

      if (id === "role") {
        // Always clear groupName when role changes
        delete updatedData.groupName;

        // If role requires group selection
        if (value === "scientist") {
          fetchGroupNames();
        }
      }

      return updatedData;
    });
  };

  // ✅ Fetch roles and update the role field in formConfig
  const fetchRoles = async () => {
  try {
    const result = await dispatch(getRoles()).unwrap();
    if (result?.roles?.length > 0) {
      const roleNames = result.roles.map((role: any) => ({
        key: role.key,
        label: role.label,
      }));
      // const roleNames = result.roles
      //                   .filter((role: any) => role.label !== "Admin")
      //                   .map((role: any) => role.label);

      const updatedConfig = formConfig.map((field) =>
        field.id === "role" ? { ...field, options: roleNames } : field
      );

      console.log("Fetched roles:", roleNames);
      console.log("RegisterForm - fetchRoles - updatedConfig:", updatedConfig);
      setRoleOptions(roleNames);
      setDynamicFormConfig(updatedConfig);
    } else {
      console.error("No roles received from API:", result);
    }
  } catch (error) {
    console.error("Failed to fetch roles:", error);
  }
};

  // ✅ Fetch group names
  const fetchGroupNames = async () => {
    try {
      const result = await dispatch(getGroupNames()).unwrap();
      if (result.length > 0) {
        // const groupNames = result.map((group: { groupName: string }) => ({
        //   id: group.groupName,
        //   name: group.groupName,
        // }));

        const groupNames = result.map((groupNames: any) => groupNames.groupName);

        console.log("Fetched group names:", groupNames);
        setGroupOptions(groupNames);
      }
    } catch (error) {
      console.error("Failed to fetch group names:", error);
    }
  };

  // ✅ Create a group when role is Admin
  // const handleCreateGroup = async (role: string) => {
  //   if (role === "groupleader") {
  //     try {
  //       const fullName = `${formData.fname}Group}`.trim();
  //       console.log("RegisterForm - handleCreateGroup - fullName:", fullName);
  //       const result = await dispatch(createGroup({ groupName: fullName })).unwrap();
  //       console.log("RegisterForm - handleCreateGroup - result:", result);
  //       if (result) {
  //         setToastMessage("Group created successfully!");
  //         setToastType("success");
  //       }
  //     } catch (error) {
  //       console.error("Failed to create group:", error);
  //       setToastMessage("Failed to create group.");
  //       setToastType("error");
  //     }
  //   }
  // };

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    dynamicFormConfig.forEach(({ id, validation }) => {
      if (id === "groupName" && formData.role !== "Admin" && formData.role !== "Scientist") return;
      const error = validateField(id, formData[id], validation);
      if (error) newErrors[id] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please fix the errors before submitting.");
      return;
    }

    try {
      // await handleCreateGroup(formData.role);

      // Map formData to RegisterUserData type
      const registerData = {
        // name: `${formData.fname || ""} ${formData.lname || ""}`.trim(),
        fname: formData.fname,
        lname: formData.lname,
        email: formData.email,
        password: formData.password,
        retypePassword: formData.retypePassword,
        role: formData.role,
        groupName: formData.role === "podept" || formData.role === "labMgmt"
                    ? ""
                    : formData.groupName
                      ? formData.groupName
                      : `${formData.fname}Group`.trim(),
        // add any other required fields here
      };

      const result = await dispatch(registerUser(registerData)).unwrap();

      if (result?.status === "success") {
        setToastMessage("Registration successful!");
        setToastType("success");
        navigate("/auth/login");
      } else {
        setToastMessage("Registration failed. Please check your details.");
        setToastType("error");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      setToastMessage("An error occurred during registration.");
      setToastType("error");
    }
  };

  // ✅ Call fetchRoles on initial render
  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <>
      <form className="row g-2 align-items-center form" onSubmit={handleSubmit}>
        {dynamicFormConfig.map((field) => {
        if (
          field.id === "groupName" &&
          // formData.role !== "groupleader" &&
          formData.role !== "scientist"
        ) {
          return null;
        }

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
          />
        );
      })}


        <div className="col-12 btnWrapper">
          <button type="submit" className="btn btn-color">Register</button>
          <Link to="/auth/login">Already have an account?</Link>
        </div>
      </form>

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
