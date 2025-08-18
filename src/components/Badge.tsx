import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "gray";
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  size = "md",
  rounded = false,
  className = "",
}) => {
  const baseClasses = "badge";

  const variantClasses = {
    primary: "badge-primary",
    secondary: "badge-secondary",
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    info: "badge-info",
    gray: "badge-gray",
  };

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const roundedClasses = rounded ? "rounded-full" : "rounded-md";

  const badgeClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={badgeClasses}>{children}</span>;
};

export default Badge;
