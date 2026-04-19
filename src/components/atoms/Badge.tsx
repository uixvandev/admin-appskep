import React from "react";
import { Chip } from "@heroui/react";

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
  const color =
    variant === "success"
      ? "success"
      : variant === "warning"
        ? "warning"
        : variant === "danger"
          ? "danger"
          : variant === "primary" || variant === "info"
            ? "accent"
            : "default";

  const styleVariant =
    variant === "secondary" || variant === "gray" ? "secondary" : "soft";

  const radiusClass = rounded ? "rounded-full" : "rounded-md";

  return (
    <Chip
      color={color}
      variant={styleVariant}
      size={size}
      className={`${radiusClass} ${className}`.trim()}
    >
      {children}
    </Chip>
  );
};

export default Badge;
