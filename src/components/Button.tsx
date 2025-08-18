import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  // Base classes
  const baseClasses = "btn";

  // Variant classes
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    success: "btn-success",
    warning: "btn-warning",
    danger: "btn-danger",
    ghost: "btn-ghost",
  };

  // Size classes
  const sizeClasses = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
    xl: "btn-xl",
  };

  // Width classes
  const widthClasses = fullWidth ? "w-full" : "";

  // Icon classes
  const iconClasses = icon ? "btn-icon" : "";

  // Combine all classes
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    iconClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Handle disabled state
  const isDisabled = disabled || loading;

  // Render icon based on position
  const renderIcon = () => {
    if (!icon && !loading) return null;

    const iconContent = loading ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      icon
    );

    return (
      <span className="flex items-center justify-center">{iconContent}</span>
    );
  };

  return (
    <button className={buttonClasses} disabled={isDisabled} {...props}>
      {iconPosition === "left" && renderIcon()}
      {!loading && children}
      {iconPosition === "right" && renderIcon()}
    </button>
  );
};

export default Button;
