import React, { forwardRef } from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  margin?: "none" | "sm" | "md" | "lg";
}

interface FormLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  help?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  help?: string;
  rows?: number;
  fullWidth?: boolean;
}

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: string;
  help?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  fullWidth?: boolean;
}

interface FormCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  help?: string;
  fullWidth?: boolean;
}

interface FormRadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  help?: string;
  fullWidth?: boolean;
}

// Form Group Component
const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className = "",
  margin = "md",
}) => {
  const marginClasses = {
    none: "",
    sm: "mb-3",
    md: "mb-5",
    lg: "mb-6",
  };

  const classes = `form-group ${marginClasses[margin]} ${className}`.trim();

  return <div className={classes}>{children}</div>;
};

// Form Label Component
const FormLabel: React.FC<FormLabelProps> = ({
  children,
  htmlFor,
  required = false,
  className = "",
}) => {
  const classes = `form-label ${className}`.trim();

  return (
    <label htmlFor={htmlFor} className={classes}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

// Form Input Component
const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      success,
      help,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputClasses = [
      "form-input",
      leftIcon && "pl-10",
      rightIcon && "pr-10",
      error && "error",
      success && "success",
      fullWidth && "w-full",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const containerClasses = fullWidth ? "w-full" : "";

    return (
      <div className={containerClasses}>
        {label && <FormLabel htmlFor={inputId}>{label}</FormLabel>}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}

          <input ref={ref} id={inputId} className={inputClasses} {...props} />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <div className="form-error flex items-center gap-2 mt-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="form-success flex items-center gap-2 mt-2">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        {help && (
          <div className="form-help flex items-center gap-2 mt-2">
            <Info className="w-4 h-4" />
            {help}
          </div>
        )}
      </div>
    );
  }
);

// Form Textarea Component
const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      success,
      help,
      rows = 4,
      fullWidth = true,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const textareaClasses = [
      "form-input",
      "resize-vertical",
      "min-h-[100px]",
      error && "error",
      success && "success",
      fullWidth && "w-full",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const containerClasses = fullWidth ? "w-full" : "";

    return (
      <div className={containerClasses}>
        {label && <FormLabel htmlFor={textareaId}>{label}</FormLabel>}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={textareaClasses}
          {...props}
        />

        {error && (
          <div className="form-error flex items-center gap-2 mt-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="form-success flex items-center gap-2 mt-2">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        {help && (
          <div className="form-help flex items-center gap-2 mt-2">
            <Info className="w-4 h-4" />
            {help}
          </div>
        )}
      </div>
    );
  }
);

// Form Select Component
const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      success,
      help,
      options,
      placeholder,
      fullWidth = true,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const selectClasses = [
      "form-input",
      "appearance-none",
      "bg-no-repeat",
      "bg-right",
      "pr-10",
      error && "error",
      success && "success",
      fullWidth && "w-full",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const containerClasses = fullWidth ? "w-full" : "";

    return (
      <div className={containerClasses}>
        {label && <FormLabel htmlFor={selectId}>{label}</FormLabel>}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "1.5em 1.5em",
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="form-error flex items-center gap-2 mt-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="form-success flex items-center gap-2 mt-2">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        {help && (
          <div className="form-help flex items-center gap-2 mt-2">
            <Info className="w-4 h-4" />
            {help}
          </div>
        )}
      </div>
    );
  }
);

// Form Checkbox Component
const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  (
    { label, error, help, fullWidth = true, className = "", id, ...props },
    ref
  ) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    const containerClasses = [fullWidth && "w-full", className]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={containerClasses}>
        <div className="flex items-start gap-3">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
              {...props}
            />
          </div>

          <div className="ml-3 text-sm">
            <FormLabel htmlFor={checkboxId} className="mb-0">
              {label}
            </FormLabel>
          </div>
        </div>

        {error && (
          <div className="form-error flex items-center gap-2 mt-2 ml-7">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {help && (
          <div className="form-help flex items-center gap-2 mt-2 ml-7">
            <Info className="w-4 h-4" />
            {help}
          </div>
        )}
      </div>
    );
  }
);

// Form Radio Component
const FormRadio = forwardRef<HTMLInputElement, FormRadioProps>(
  (
    { label, error, help, fullWidth = true, className = "", id, ...props },
    ref
  ) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    const containerClasses = [fullWidth && "w-full", className]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={containerClasses}>
        <div className="flex items-start gap-3">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              id={radioId}
              type="radio"
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 focus:ring-2"
              {...props}
            />
          </div>

          <div className="ml-3 text-sm">
            <FormLabel htmlFor={radioId} className="mb-0">
              {label}
            </FormLabel>
          </div>
        </div>

        {error && (
          <div className="form-error flex items-center gap-2 mt-2 ml-7">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {help && (
          <div className="form-help flex items-center gap-2 mt-2 ml-7">
            <Info className="w-4 h-4" />
            {help}
          </div>
        )}
      </div>
    );
  }
);

// Export all components
export {
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadio,
};
