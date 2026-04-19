import React from "react";
import { Button as HeroButton, Spinner } from "@heroui/react";
import type { ButtonProps as HeroButtonProps } from "@heroui/react";

interface ButtonProps extends Omit<
  HeroButtonProps,
  "variant" | "size" | "isPending" | "isDisabled" | "children" | "onClick"
> {
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
  onClick?: (event: React.SyntheticEvent) => void;
  disabled?: boolean;
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
  onClick,
  onPress,
  ...props
}) => {
  const baseVariant =
    variant === "danger"
      ? "danger"
      : variant === "secondary" ||
          variant === "success" ||
          variant === "warning"
        ? "secondary"
        : variant === "ghost"
          ? "ghost"
          : "primary";

  const sizeVariant = size === "xl" ? "lg" : size;

  const toneClasses =
    variant === "success"
      ? "bg-[color:var(--success)] text-[color:var(--success-foreground)]"
      : variant === "warning"
        ? "bg-[color:var(--warning)] text-[color:var(--warning-foreground)]"
        : "";

  const xlClasses = size === "xl" ? "h-12 px-6 text-base" : "";

  const isDisabled = disabled || loading;

  const renderIcon = (isPending: boolean) => {
    if (isPending) {
      return <Spinner color="current" size="sm" />;
    }
    return icon ? (
      <span className="inline-flex items-center">{icon}</span>
    ) : null;
  };

  const handlePress = (event: unknown) => {
    if (onPress) {
      onPress(event as Parameters<NonNullable<HeroButtonProps["onPress"]>>[0]);
    }

    if (onClick) {
      const asEvent =
        event &&
        typeof (event as { preventDefault?: () => void }).preventDefault ===
          "function"
          ? (event as React.SyntheticEvent)
          : ({
              preventDefault: () => {},
              stopPropagation: () => {},
            } as React.SyntheticEvent);
      onClick(asEvent);
    }
  };

  return (
    <HeroButton
      variant={baseVariant}
      size={sizeVariant}
      fullWidth={fullWidth}
      isDisabled={isDisabled}
      isPending={loading}
      onPress={handlePress}
      className={`${toneClasses} ${xlClasses} ${className}`.trim()}
      {...props}
    >
      {({ isPending }) => (
        <>
          {iconPosition === "left" && renderIcon(isPending)}
          <span className="inline-flex items-center gap-2">{children}</span>
          {iconPosition === "right" && renderIcon(isPending)}
        </>
      )}
    </HeroButton>
  );
};

export default Button;
