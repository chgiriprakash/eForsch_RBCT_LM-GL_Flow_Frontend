import React, { ChangeEvent } from "react";

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

type OptionType = string | { key: string; label: string };

interface InputFieldProps {
  id: string;
  label: string;
  type: string; // text, email, password, number, select, checkbox, date, radio, etc.
  value: any;
  options?: OptionType[];
  validation?: ValidationRules;
  error?: string;
  onChange: (id: string, value: any) => void;
  disabled?: boolean;
  isLoggedIn?: boolean;
}

const ghsImageMap: Record<string, string> = {
  "Explosive": "/src/assets/ghs/ghs_001.jpg",
  "Flammable": "/src/assets/ghs/ghs_002.jpg",
  "Oxidizing": "/src/assets/ghs/ghs_003.jpg",
  "Corrosive": "/src/assets/ghs/ghs_005.jpg",
  "Toxic": "/src/assets/ghs/ghs_006.jpg",
  "Harmful": "/src/assets/ghs/ghs_007.jpg",
  "Gas under pressure": "/src/assets/ghs/ghs_008.jpg",
  "Environmental hazard": "/src/assets/ghs/ghs_009.jpg",
};

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type,
  value,
  options,
  error,
  onChange,
  disabled = false,
  isLoggedIn,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    console.log("InputField - target element:", target);

    if (target.type === "checkbox" && type !== "checkbox-group") {
      onChange(id, target.checked);
    } else {
      onChange(id, target.value);
    }
  };

  const handleCheckboxGroupChange = (option: string) => {
    const newValue = Array.isArray(value) ? [...value] : [];
    const index = newValue.indexOf(option);

    if (index > -1) {
      newValue.splice(index, 1); // Remove
    } else {
      newValue.push(option); // Add
    }

    onChange(id, newValue);
  };

  const renderOption = (option: OptionType) => {
    if (typeof option === "string") {
      return (
        <option key={option} value={option}>
          {option}
        </option>
      );
    }

    return (
      <option key={option.key} value={option.key}>
        {option.label}
      </option>
    );
  };

  return (
    <div className={isLoggedIn ? "col-3" : "col-6"}>
      {/* {console.log("InputField - isLoggedIn parameter:", isLoggedIn)} */}
      <label htmlFor={id} className="col-form-label label">
        {label}
      </label>

      {type === "select" ? (
        <select
          id={id}
          value={value || ""}
          onChange={handleChange}
          className={`input ${error ? "errorInput" : ""}`}
          disabled={disabled}
        >
          <option value="">Select...</option>
          {options?.map(renderOption)}
        </select>
      ) : type === "checkbox" ? (
        <input
          id={id}
          type="checkbox"
          checked={value || false}
          onChange={handleChange}
          className="checkbox"
          disabled={disabled}
        />
      ) : type === "radio" ? (
        <div className="radio-group">
          {["Yes", "No"].map((option) => (
            <label key={option} className="radio-label">
              <input
                type="radio"
                name={id}
                value={option}
                checked={value === option}
                onChange={handleChange}
                disabled={disabled}
                className="radio-input"
              />
              {option}
            </label>
          ))}
        </div>
      ) : type === "checkbox-group" ? (
        <div className="checkbox-group">
          {options?.map((option) => {
            const val = typeof option === "string" ? option : option.key;
            const label = typeof option === "string" ? option : option.label;

            return (
              <label key={val} className="checkbox-option">
                <input
                  type="checkbox"
                  name={id}
                  value={val}
                  checked={Array.isArray(value) && value.includes(val)}
                  onChange={() => handleCheckboxGroupChange(val)}
                  disabled={disabled}
                  className="checkbox-img"
                />
                {ghsImageMap[val] ? (
                  <img
                    className="checkbox-img"
                    src={ghsImageMap[val]}
                    alt={label}
                    style={{ width: "30px", height: "30px", margin: "4px 8px" }}
                  />
                ) : (
                  label
                )}
              </label>
            );
          })}
        </div>
      ) : (
        <input
          id={id}
          type={type}
          value={value || ""}
          onChange={handleChange}
          className={`input ${error ? "errorInput" : ""}`}
          disabled={disabled}
        />
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default InputField;
