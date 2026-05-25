import React, { useState, useEffect } from "react";
import InputField from "./InputField";
// import Files from "react-files";

type FormField = {
  options?: string[];
  id: string;
  label: string;
  type: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
  };
  showIf?: {
    field: string;
    value: any;
  };
};

type FormProps = {
  formConfig: FormField[];
  initialValues: Record<string, any>;
  onSubmit: (formData: Record<string, any>) => void;
};

const ReusableForm: React.FC<FormProps> = ({ formConfig, initialValues, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleFileChange = (files: any[]) => {
    if (files && files.length > 0) {
      // console.log("Selected file:", files[0]);
      setFormData((prev) => ({
        ...prev,
        attachment: files[0], // ✅ directly store the File object
      }));
    } else {
      // console.log("No file selected");
      setFormData((prev) => ({
        ...prev,
        attachment: null,
      }));
    }
  };


  const validateField = (id: string, value: any, validation: any) => {
    console.log("Validating field:", id, value, validation);
    if (!validation) return "";

    if (validation.required && !value) return "This field is required.";
    if (validation.minLength && value.length < validation.minLength)
      return `Minimum length is ${validation.minLength} characters.`;
    if (validation.pattern && !validation.pattern.test(value)) return "Invalid format.";

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    console.log("ReusableForm - newErrors initialized:", newErrors);

    formConfig.forEach(({ id, validation, showIf }) => {
      const shouldShow =
        !showIf || formData[showIf.field] === showIf.value;

      if (shouldShow) {
        const error = validateField(id, formData[id], validation);
        console.log("ReusableForm - field validation error for", id, ":", error);
        if (error) newErrors[id] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
      setToastMessage("Form submitted successfully!");
      setToastType("success");
    } catch (error) {
      setToastMessage("Failed to submit form!");
      setToastType("error");
    }
  };

  return (
    <>
      <form className="row gy-2 align-items-center" onSubmit={handleSubmit}>
        {formConfig.map((field) => {
          const shouldShow =
            !field.showIf || formData[field.showIf.field] === field.showIf.value;

          if (!shouldShow) return null;

          return (
            <React.Fragment key={field.id}>
              {field.type === "file" ? (
                <div className="files">
                  {/* <Files
                    className="files-dropzone"
                    onChange={handleFileChange}
                    onError={(error: any) =>
                      console.error("File upload error:", error)
                    }
                    accepts={[".pdf"]}
                    multiple
                    maxFileSize={10000000}
                    minFileSize={0}
                    clickable
                  >
                    Drop files here or click to upload
                  </Files> */}
                  <input
                    type="file"
                    accept=".pdf"
                    className="files-dropzone"
                    onChange={(e) => {
                      const files = e.target.files;
                      handleFileChange(files ? Array.from(files) : []);
                    }}
                  />
                </div>
              ) : (
                <InputField
                  id={field.id}
                  label={field.label}
                  type={field.type}
                  value={formData[field.id] || ""}
                  options={field.options}
                  validation={field.validation}
                  error={errors[field.id]}
                  onChange={handleChange}
                  isLoggedIn={true}
                />
              )}
            </React.Fragment>
          );
        })}
        <div className="col-12 btnWrapper">
          <button type="submit" className="btn btn-color">
            Submit
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setFormData(initialValues)}
          >
            Reset
          </button>
        </div>
      </form>

      {toastMessage && (
        <div
          className={`toast ${
            toastType === "success" ? "toast-success" : "toast-error"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default ReusableForm;
