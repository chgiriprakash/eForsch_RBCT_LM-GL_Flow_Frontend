import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../shared/hooks/useAppDispatch";
import ReusableForm from "../../../shared/components/ReusableForm";

import profileConfig from "../../../shared/config/profileConfig";
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
} from "../dashboardSlice";

const ProfilePage = () => {
  const dispatch = useAppDispatch();

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : {};

  const [initialValues, setInitialValues] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  // ✅ Default structure
  const defaultValues = {
    title: "",
    firstName: "",
    secondName: "",
    email: "",
    labName: "",
    groupLeader: "",
    roomNumber: "",
    addressLine1: "",
    addressLine2: "",
    buildingNumber: "",
    streetName: "",
    city: "",
    role: "",
    groupName: "",
  };

  // 🔽 Fetch profile
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        const res = await dispatch(getProfile(user.id)).unwrap();

        setInitialValues({
          ...defaultValues,
          ...res.data,
        });

        setIsEdit(true);
        setIsEditable(false); // read-only after load
      } catch {
        const [firstName = "", secondName = ""] = (user.name || "").split(" ");

        setInitialValues({
          ...defaultValues,
          firstName,
          secondName,
          email: user.email || "",
          role: user.role || "",
          groupName: user.groupName || "",
          userId: user.id,
        });

        setIsEdit(false);
        setIsEditable(true); // allow create
      }
    };

    fetchProfile();
  }, [dispatch, user.id]);

  // 🔽 Save
  const handleSubmit = async (formData: any) => {
    const payload = {
      ...formData,
      userId: user.id,
      role: user.role,
      groupName: user.groupName,
    };

    if (isEdit) {
      await dispatch(updateProfile({ userId: user.id, data: payload }));
    } else {
      await dispatch(createProfile(payload));
    }

    setIsEditable(false);
    setIsEdit(true);

    alert("Profile saved successfully");
  };

  // 🔽 Delete
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your profile?")) return;

    try {
      await dispatch(deleteProfile(user.id)).unwrap();

      // reset form
      setInitialValues({
        ...defaultValues,
        email: user.email || "",
        role: user.role || "",
        groupName: user.groupName || "",
        userId: user.id,
      });

      setIsEdit(false);
      setIsEditable(true);

      alert("Profile deleted successfully");
    } catch {
      alert("Failed to delete profile");
    }
  };

  // ⏳ wait until data ready
  if (!Object.keys(initialValues).length) return <p>Loading...</p>;

  return (
    <div className="product-details">
      {/* 🔥 Edit + Delete Buttons */}
      <div className="d-flex justify-content-end mb-2 gap-2">
        {!isEditable && (
          <>
            <button
              className="btn btn-color btn-sm"
              onClick={() => setIsEditable(true)}
            >
              Edit
            </button>

            <button
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        )}
      </div>

      <ReusableForm
        formConfig={profileConfig()}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        disabled={!isEditable}
      />
    </div>
  );
};

export default ProfilePage;