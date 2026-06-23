import React, { useState, useEffect, lazy, Suspense } from "react";
import InputField from "./InputField";
// Lazy load ReactQuill to avoid bundling issues
const ReactQuill = lazy(() => import("react-quill").then(m => ({ default: m.default })));
import "quill/dist/quill.snow.css";

type FormField = {
  options?: any[];
  id: string;
  label: string;
  type: string;

  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  helpText?: string;

  validation?: {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
  };

  showIf?: {
    field: string;
    value: any;
  };

  breakAfter?: boolean;
  colSize?: string;
};

type FormProps = {
  formConfig: FormField[];
  initialValues: Record<string, any>;
  onSubmit: (formData: Record<string, any>) => void;
  disabled?: boolean;
  onFieldChange?: (id: string, value: any) => Partial<Record<string, any>> | void;
  existingFileNames?: Record<string, string>;
};

const ReusableForm: React.FC<FormProps> = ({
  formConfig,
  initialValues,
  onSubmit,
  disabled = false,
  onFieldChange,
  existingFileNames = {},
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [removedFiles, setRemovedFiles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handleChange = (id: string, value: any) => {
    // Call onFieldChange and get any extra field updates (e.g. auto-fill company internal no)
    const extraUpdates = onFieldChange ? (onFieldChange(id, value) || {}) : {};
    setFormData((prev) => ({
      ...prev,
      [id]: value,
      ...extraUpdates,
    }));
  };

  // ✅ FIXED FILE HANDLER (append + limit)
  const handleFileChange = (files: File[], field: FormField) => {
    const existingFiles = formData[field.id] || [];
    const totalFiles = [...existingFiles, ...files];

    if (field.maxFiles && totalFiles.length > field.maxFiles) {
      alert(`Maximum ${field.maxFiles} files allowed`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field.id]: totalFiles,
    }));
  };

  const validateField = (id: string, value: any, validation: any) => {
    console.log(`Validating field: ${id} with value:`, value, "and rules:", validation);
    if (!validation) return "";

    if (validation.required && !value)
      return "This field is required.";

    if (validation.minLength && value?.length < validation.minLength)
      return `Minimum length is ${validation.minLength} characters.`;

    if (validation.pattern && !validation.pattern.test(value))
      return "Invalid format.";

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    console.log("🔍 ReusableForm submit - full formData:", JSON.stringify(formData, null, 2));

    const newErrors: Record<string, string> = {};

    formConfig.forEach(({ id, validation, showIf }) => {
      const shouldShow =
        !showIf || formData[showIf.field] === showIf.value;

      if (shouldShow) {
        const error = validateField(id, formData[id], validation);
        if (error) newErrors[id] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({ ...formData, _removedFiles: removedFiles });
  };

  return (
    <form className="rf-form row gy-3 align-items-start" onSubmit={handleSubmit}>
      {formConfig.map((field) => {
        const shouldShow =
          !field.showIf ||
          formData[field.showIf.field] === field.showIf.value;

        if (!shouldShow) return null;

        return (
          <React.Fragment key={field.id}>

            {/* ✅ FILE INPUT */}
            {field.type === "file" && (
              <div className="files col-12">
                <label className="col-form-label label">
                  {field.label} (
                  {formData[field.id]?.length || 0} /{" "}
                  {field.maxFiles || 5})
                </label>

                {field.helpText && (
                  <div
                    className="fw-bold mb-2"
                    style={{ color: "#0d6efd" }}
                  >
                    {field.helpText}
                  </div>
                )}

                <input
                  key={formData[field.id]?.length} // ✅ reset input
                  type="file"
                  className="files-dropzone"
                  multiple={field.multiple}
                  accept={
                    field.accept ||
                    ".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  }
                  disabled={
                    disabled ||
                    (formData[field.id]?.length >=
                      (field.maxFiles || 5))
                  }
                  onChange={(e) => {
                    const files = e.target.files
                      ? Array.from(e.target.files)
                      : [];
                    handleFileChange(files, field);
                  }}
                />

                {/* ✅ EXISTING SERVER FILE */}
                {existingFileNames[field.id] && !formData[field.id]?.length && !removedFiles[field.id] && (
                  <div className="mt-2 d-flex align-items-center gap-2">
                    <span className="text-muted" style={{ fontSize: "0.85rem" }}>Current file:</span>
                    <span className="text-primary fw-semibold" style={{ fontSize: "0.85rem" }}>{existingFileNames[field.id]}</span>
                    {!disabled && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        style={{ fontSize: "0.75rem", padding: "1px 6px" }}
                        onClick={() => setRemovedFiles(prev => ({ ...prev, [field.id]: true }))}
                        title="Remove current file"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                )}

                {/* ✅ FILE LIST */}
                {formData[field.id]?.length > 0 && (
                  <div className="mt-2">
                    {formData[field.id].map(
                      (file: File, index: number) => (
                        <div
                          key={index}
                          className="d-flex justify-content-between align-items-center m-2"
                        >
                          <span>{file.name}</span>

                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              const updatedFiles = [
                                ...(formData[field.id] || []),
                              ];
                              updatedFiles.splice(index, 1);

                              setFormData((prev) => ({
                                ...prev,
                                [field.id]: updatedFiles,
                              }));
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

                {errors[field.id] && (
                  <div className="text-danger">
                    {errors[field.id]}
                  </div>
                )}
              </div>
            )}

            {/* ✅ RICH TEXT */}
            {field.type === "richtext" && (
              <div className="col-12">
                <label className="col-form-label label">
                  {field.label}
                </label>
                <Suspense fallback={<div>Loading editor...</div>}>
                  <ReactQuill
                    theme="snow"
                    value={formData[field.id] || ""}
                    onChange={(value: string) =>
                      handleChange(field.id, value)
                    }
                    readOnly={disabled}
                  />
                </Suspense>
                {errors[field.id] && (
                  <div className="text-danger">
                    {errors[field.id]}
                  </div>
                )}
              </div>
            )}

            {/* ✅ DEFAULT INPUT */}
          <>
            {field.type !== "file" &&
              field.type !== "richtext" && (
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
                  totalFields={formConfig.length}
                  colSize={field.colSize}
                  disabled={disabled}
                />
            )}

            {field.breakAfter && (
              <div className="col-12"></div>
            )}
          </>
          </React.Fragment>
        );
      })}

      {/* ✅ FIXED BUTTON AREA */}
      <div className="col-12 rf-btn-area">
        <button
          type="submit"
          className="rf-btn-submit"
          disabled={disabled}
        >
          <i className="fa fa-check me-2" />Submit
        </button>

        <button
          type="button"
          className="rf-btn-reset"
          onClick={() => setFormData(initialValues)}
        >
          <i className="fa fa-refresh me-2" />Reset
        </button>
      </div>
    </form>
  );
};

export default ReusableForm;