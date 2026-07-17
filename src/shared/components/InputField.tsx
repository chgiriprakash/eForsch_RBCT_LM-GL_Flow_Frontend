import React, { ChangeEvent, useState, useRef, useEffect } from "react";

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
  type: string;
  value: any;
  options?: OptionType[];
  validation?: ValidationRules;
  error?: string;
  onChange: (id: string, value: any) => void;
  disabled?: boolean;
  isLoggedIn?: boolean;
  totalFields?: number;
  colSize?: string;
  multiple?: boolean;
}

const ghsImageMap: Record<string, string> = {
  Explosive: "/src/assets/ghs/ghs_001.jpg",
  Flammable: "/src/assets/ghs/ghs_002.jpg",
  Oxidizing: "/src/assets/ghs/ghs_003.jpg",
  Corrosive: "/src/assets/ghs/ghs_005.jpg",
  Toxic: "/src/assets/ghs/ghs_006.jpg",
  Harmful: "/src/assets/ghs/ghs_007.jpg",
  "Gas under pressure": "/src/assets/ghs/ghs_008.jpg",
  "Environmental hazard": "/src/assets/ghs/ghs_009.jpg",
};

const TypeaheadField: React.FC<{
  id: string;
  value: any;
  options: OptionType[];
  onChange: (val: any) => void;
  disabled?: boolean;
  error?: string;
  multiple?: boolean;
}> = ({ id, value, options, onChange, disabled, error, multiple }) => {
  const [query, setQuery] = useState(typeof value === "string" ? value : "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedItems: string[] = Array.isArray(value)
    ? value
    : value
    ? [value]
    : [];

  useEffect(() => { 
    if (!multiple) {
      setQuery(value || "");
    }
  }, [value, multiple]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (multiple) setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [multiple]);

  const getLabel = (opt: OptionType) => typeof opt === "string" ? opt : opt.label;
  const getKey   = (opt: OptionType) => typeof opt === "string" ? opt : opt.key;

  const filtered = options
    .filter(Boolean)
    .filter((opt) => !multiple || !selectedItems.includes(getKey(opt)))
    .filter((opt) => {
      const searchString = typeof query === "string" ? query : "";
      return getLabel(opt).toLowerCase().includes(searchString.toLowerCase());
    });

  const handleClearSingle = () => {
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
    onChange("");
  };

  const removeMultiItem = (itemToRemove: string) => {
    const updated = selectedItems.filter((item) => item !== itemToRemove);
    onChange(updated);
  };

  const selectOption = (opt: OptionType) => {
    const selectedKey = getKey(opt);

    if (multiple) {
      if (!selectedItems.includes(selectedKey)) {
        const updated = [...selectedItems, selectedKey];
        onChange(updated);
      }
      setQuery(""); 
    } else {
      setQuery(getLabel(opt));
      onChange(selectedKey);
    }

    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (activeIndex + 1) % filtered.length;
      setActiveIndex(next);
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (activeIndex - 1 + filtered.length) % filtered.length;
      setActiveIndex(prev);
      listRef.current?.children[prev]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectOption(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const isLocked = !multiple && selectedItems.length > 0;

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
      
      {/* 🔮 MULTI-SELECT VISUAL BADGES */}
      {multiple && selectedItems.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "4px" }}>
          {selectedItems.map((itemKey) => {
            // Find matched option mapping object to display full label descriptive text cleanly
            const matchingOpt = options.find(o => getKey(o) === itemKey);
            const labelText = matchingOpt ? getLabel(matchingOpt) : itemKey;
            return (
              <span 
                key={itemKey} 
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  background: "#e9ecef", 
                  borderRadius: "4px", 
                  padding: "2px 8px", 
                  fontSize: "12px",
                  color: "#495057",
                  border: "1px solid #ced4da"
                }}
              >
                {labelText}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeMultiItem(itemKey)}
                    style={{ 
                      background: "none", 
                      border: "none", 
                      marginLeft: "6px", 
                      cursor: "pointer", 
                      color: "#dc3545", 
                      fontWeight: "bold",
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
        <input
          id={id}
          type="text"
          value={typeof query === "string" ? query : ""}
          disabled={disabled}
          readOnly={isLocked}
          autoComplete="off"
          placeholder={multiple ? "Type to add multiple..." : "Type to search..."}
          className={`input ${error ? "errorInput" : ""} ${isLocked ? "typeahead-locked" : ""}`}
          style={{ flex: 1 }}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(-1); if(!multiple) onChange(e.target.value); }}
          onFocus={() => { if (!isLocked) setOpen(true); }}
          onKeyDown={handleKeyDown}
        />
        {isLocked && !disabled && (
          <button type="button" className="typeahead-clear" onClick={handleClearSingle} title="Clear selection">
            ×
          </button>
        )}
        {open && !isLocked && filtered.length > 0 && (
          <ul className="typeahead-dropdown" ref={listRef}>
            {filtered.map((opt, idx) => (
              <li
                key={getKey(opt)}
                className={`typeahead-option ${idx === activeIndex ? "typeahead-option-active" : ""}`}
                onMouseDown={() => selectOption(opt)}
              >
                {getLabel(opt)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
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
  totalFields,
  colSize,
  multiple,
}) => {
  const columnClass =
    colSize
      ? colSize
      : totalFields === 1
      ? "col-12"
      : isLoggedIn
      ? "col-3"
      : "col-6";

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;

    if (target.type === "checkbox" && type !== "checkbox-group") {
      onChange(id, target.checked);
    } else {
      onChange(id, target.value);
    }
  };

  const handleCheckboxGroupChange = (option: string) => {
    const newValue = Array.isArray(value) ? [...value] : [];
    const index = newValue.indexOf(option);

    if (index > -1) newValue.splice(index, 1);
    else newValue.push(option);

    onChange(id, newValue);
  };

  const renderOption = (option: OptionType | null | undefined) => {
    if (!option) return null;

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
    <div className={`${columnClass} rf-field`}>
      <label htmlFor={id} className="rf-label">
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
          {(options || []).filter(Boolean).map(renderOption)}
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
              />
              {option}
            </label>
          ))}
        </div>
      ) : type === "checkbox-group" ? (
        <div className="checkbox-group">
          {(options || []).filter(Boolean).map((option) => {
            const val =
              typeof option === "string" ? option : option?.key;
            const label =
              typeof option === "string" ? option : option?.label;

            return (
              <label key={val} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(val)}
                  onChange={() => handleCheckboxGroupChange(val)}
                  disabled={disabled}
                  className="checkbox-img"
                />
                {ghsImageMap[val] ? (
                  <img
                    src={ghsImageMap[val]}
                    alt={label}
                    title={label}
                    style={{
                      width: "30px",
                      height: "30px",
                      margin: "4px 8px",
                    }}
                  />
                ) : (
                  <span>{label}</span>
                )}
              </label>
            );
          })}
        </div>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          value={value || ""}
          rows={3}
          disabled={disabled}
          className={`input ${error ? "errorInput" : ""}`}
          style={{ resize: "vertical" }}
          onChange={(e) => onChange(id, e.target.value)}
        />
      ) : ((type as unknown as string) === "typeahead" || (type as unknown as string) === "multiselect") ? (
        <TypeaheadField
          id={id}
          value={value || ""}
          options={options || []}
          onChange={(val) => onChange(id, val)}
          disabled={disabled}
          error={error}
          multiple={type === "multiselect" ? true : multiple}
        />
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