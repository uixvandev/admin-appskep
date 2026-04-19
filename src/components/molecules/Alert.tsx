import React from "react";
import { Alert as HeroAlert, CloseButton } from "@heroui/react";

interface AlertProps {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = "info",
  title,
  dismissible = false,
  onDismiss,
  className = "",
}) => {
  const status =
    variant === "success"
      ? "success"
      : variant === "warning"
        ? "warning"
        : variant === "danger"
          ? "danger"
          : "accent";

  return (
    <HeroAlert status={status} className={className}>
      <HeroAlert.Indicator />
      <HeroAlert.Content>
        {title && <HeroAlert.Title>{title}</HeroAlert.Title>}
        <HeroAlert.Description>{children}</HeroAlert.Description>
      </HeroAlert.Content>
      {dismissible && (
        <CloseButton aria-label="Dismiss alert" onPress={onDismiss} />
      )}
    </HeroAlert>
  );
};

export default Alert;
