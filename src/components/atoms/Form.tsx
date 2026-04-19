import React, { forwardRef } from "react";
import {
  Checkbox,
  Description,
  FieldError,
  Input,
  Label,
  ListBox,
  Radio,
  RadioGroup,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";

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

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  help?: string;
  rows?: number;
  fullWidth?: boolean;
}

interface FormSelectProps {
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  defaultValue?: string;
  className?: string;
  label?: string;
  error?: string;
  success?: string;
  help?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  fullWidth?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface FormCheckboxProps {
  id?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  className?: string;
  label: string;
  error?: string;
  help?: string;
  fullWidth?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface FormRadioProps {
  id?: string;
  name?: string;
  value?: string | number | readonly string[];
  disabled?: boolean;
  checked?: boolean;
  className?: string;
  label: string;
  error?: string;
  help?: string;
  fullWidth?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

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

const FormLabel: React.FC<FormLabelProps> = ({
  children,
  htmlFor,
  required = false,
  className = "",
}) => {
  return (
    <Label htmlFor={htmlFor} className={className}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
  );
};

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
      required,
      onChange,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const containerClasses = fullWidth ? "w-full" : "";

    return (
      <TextField
        className={containerClasses}
        isInvalid={Boolean(error)}
        isRequired={required}
        name={props.name}
      >
        {label && <FormLabel htmlFor={inputId}>{label}</FormLabel>}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <Input
            ref={ref}
            id={inputId}
            className={`${leftIcon ? "pl-10" : ""} ${rightIcon ? "pr-10" : ""} ${className}`.trim()}
            onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <FieldError>{error}</FieldError>
        ) : success ? (
          <Description className="text-green-600">{success}</Description>
        ) : help ? (
          <Description>{help}</Description>
        ) : null}
      </TextField>
    );
  },
);

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
      required,
      onChange,
      ...props
    },
    ref,
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const containerClasses = fullWidth ? "w-full" : "";

    return (
      <TextField
        className={containerClasses}
        isInvalid={Boolean(error)}
        isRequired={required}
        name={props.name}
      >
        {label && <FormLabel htmlFor={textareaId}>{label}</FormLabel>}
        <TextArea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={className}
          onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
          {...props}
        />
        {error ? (
          <FieldError>{error}</FieldError>
        ) : success ? (
          <Description className="text-green-600">{success}</Description>
        ) : help ? (
          <Description>{help}</Description>
        ) : null}
      </TextField>
    );
  },
);

const FormSelect = ({
  label,
  error,
  success,
  help,
  options,
  placeholder = "Pilih...",
  fullWidth = true,
  className = "",
  id,
  name,
  disabled,
  required,
  value,
  defaultValue,
  onChange,
}: FormSelectProps) => {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
  const containerClasses = fullWidth ? "w-full" : "";

  const selectedKey = typeof value === "string" ? value : undefined;
  const defaultSelectedKey =
    typeof defaultValue === "string" ? defaultValue : undefined;

  const handleSelectionChange = (key: unknown) => {
    if (!onChange) return;
    const event = {
      target: { value: String(key) },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(event);
  };

  return (
    <div className={containerClasses}>
      {label && <FormLabel htmlFor={selectId}>{label}</FormLabel>}
      <Select
        className={className}
        placeholder={placeholder}
        selectedKey={selectedKey}
        defaultSelectedKey={defaultSelectedKey}
        onSelectionChange={handleSelectionChange}
        isInvalid={Boolean(error)}
        isRequired={required}
        name={name}
        isDisabled={disabled}
      >
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {options.map((option) => (
              <ListBox.Item
                key={option.value}
                id={option.value}
                textValue={option.label}
                isDisabled={option.disabled}
              >
                {option.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      {error ? (
        <FieldError>{error}</FieldError>
      ) : success ? (
        <Description className="text-green-600">{success}</Description>
      ) : help ? (
        <Description>{help}</Description>
      ) : null}
    </div>
  );
};

const FormCheckbox = ({
  label,
  error,
  help,
  fullWidth = true,
  className = "",
  onChange,
  checked,
  id,
  name,
  value,
  disabled,
  defaultChecked,
}: FormCheckboxProps) => {
  const containerClasses = fullWidth ? "w-full" : "";
  const isSelected = Boolean(checked);

  const handleChange = (selected: boolean) => {
    if (!onChange) return;
    const event = {
      target: { checked: selected },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  return (
    <div className={containerClasses}>
      <Checkbox
        id={id}
        name={name}
        value={value}
        defaultSelected={defaultChecked}
        isSelected={isSelected}
        onChange={handleChange}
        isDisabled={disabled}
        className={className}
      >
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>{label}</Label>
          {help && <Description>{help}</Description>}
          {error && <FieldError>{error}</FieldError>}
        </Checkbox.Content>
      </Checkbox>
    </div>
  );
};

const FormRadio = ({
  label,
  error,
  help,
  fullWidth = true,
  className = "",
  onChange,
  checked,
  value: propValue,
  name,
  disabled,
}: FormRadioProps) => {
  const containerClasses = fullWidth ? "w-full" : "";
  const value = propValue ? String(propValue) : "option";
  const selectedValue = checked ? value : undefined;

  const handleChange = (nextValue: string) => {
    if (!onChange) return;
    const event = {
      target: { value: nextValue },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  return (
    <div className={containerClasses}>
      <RadioGroup
        value={selectedValue}
        onChange={handleChange}
        className={className}
        name={name}
        isDisabled={disabled}
      >
        <Radio value={value}>
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>{label}</Label>
            {help && <Description>{help}</Description>}
            {error && <FieldError>{error}</FieldError>}
          </Radio.Content>
        </Radio>
      </RadioGroup>
    </div>
  );
};

export {
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadio,
};
