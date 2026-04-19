import React from "react";
import { Card as HeroCard } from "@heroui/react";

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
  const interactiveClasses = interactive ? "cursor-pointer" : "";
  const hoverClasses = hover ? "hover:shadow-lg hover:-translate-y-1" : "";

  const shadowClasses = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    none: "shadow-none",
  };

  const borderClasses = border ? "border border-border" : "border-0";
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

  return (
    <HeroCard
      className={`${interactiveClasses} ${hoverClasses} ${shadowClasses[shadow]} ${borderClasses} ${paddingClasses} ${className}`.trim()}
      variant="default"
    >
      {children}
    </HeroCard>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
  border = true,
  background = "light",
}) => {
  const borderClasses = border ? "border-b border-border" : "";
  const backgroundClasses = {
    none: "",
    light: "bg-surface-secondary",
    primary: "bg-accent/10",
  };

  return (
    <HeroCard.Header
      className={`${borderClasses} ${backgroundClasses[background]} ${className}`.trim()}
    >
      {children}
    </HeroCard.Header>
  );
};

const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = "",
  padding = "md",
}) => {
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

  return (
    <HeroCard.Content className={`${paddingClasses} ${className}`.trim()}>
      {children}
    </HeroCard.Content>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
  border = true,
  background = "light",
}) => {
  const borderClasses = border ? "border-t border-border" : "";
  const backgroundClasses = {
    none: "",
    light: "bg-surface-secondary",
    primary: "bg-accent/10",
  };

  return (
    <HeroCard.Footer
      className={`${borderClasses} ${backgroundClasses[background]} ${className}`.trim()}
    >
      {children}
    </HeroCard.Footer>
  );
};

export { Card, CardHeader, CardBody, CardFooter };
export default Card;
