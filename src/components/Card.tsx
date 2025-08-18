import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  hover?: boolean;
  shadow?: "sm" | "md" | "lg" | "xl" | "none";
  border?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
  background?: "none" | "light" | "primary";
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
  background?: "none" | "light" | "primary";
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  interactive = false,
  hover = false,
  shadow = "md",
  border = true,
  padding = "md",
}) => {
  const baseClasses = "card";

  const interactiveClasses = interactive ? "card-interactive" : "";
  const hoverClasses = hover ? "hover:shadow-lg hover:-translate-y-1" : "";

  const shadowClasses = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    none: "",
  };

  const borderClasses = border ? "border border-gray-200" : "border-0";
  const paddingClasses =
    padding !== "none"
      ? `p-${
          padding === "sm"
            ? "4"
            : padding === "md"
            ? "6"
            : padding === "lg"
            ? "8"
            : "10"
        }`
      : "";

  const cardClasses = [
    baseClasses,
    interactiveClasses,
    hoverClasses,
    shadowClasses[shadow],
    borderClasses,
    paddingClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={cardClasses}>{children}</div>;
};

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
  border = true,
  background = "light",
}) => {
  const baseClasses = "card-header";

  const borderClasses = border ? "border-b border-gray-100" : "";
  const backgroundClasses = {
    none: "",
    light: "bg-gray-50",
    primary: "bg-primary-50",
  };

  const headerClasses = [
    baseClasses,
    borderClasses,
    backgroundClasses[background],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={headerClasses}>{children}</div>;
};

const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = "",
  padding = "md",
}) => {
  const baseClasses = "card-body";

  const paddingClasses =
    padding !== "none"
      ? `p-${
          padding === "sm"
            ? "4"
            : padding === "md"
            ? "6"
            : padding === "lg"
            ? "8"
            : "10"
        }`
      : "";

  const bodyClasses = [baseClasses, paddingClasses, className]
    .filter(Boolean)
    .join(" ");

  return <div className={bodyClasses}>{children}</div>;
};

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
  border = true,
  background = "light",
}) => {
  const baseClasses = "card-footer";

  const borderClasses = border ? "border-t border-gray-100" : "";
  const backgroundClasses = {
    none: "",
    light: "bg-gray-50",
    primary: "bg-primary-50",
  };

  const footerClasses = [
    baseClasses,
    borderClasses,
    backgroundClasses[background],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={footerClasses}>{children}</div>;
};

// Export components
export { Card, CardHeader, CardBody, CardFooter };
export default Card;
