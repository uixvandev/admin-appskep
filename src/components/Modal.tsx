import React, { useEffect, useRef } from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  variant?: "default" | "success" | "warning" | "danger" | "info";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  variant = "default",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === overlayRef.current) {
      onClose();
    }
  };

  // Handle modal click (prevent closing when clicking inside modal)
  const handleModalClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "max-w-md";
      case "md":
        return "max-w-lg";
      case "lg":
        return "max-w-2xl";
      case "xl":
        return "max-w-4xl";
      case "full":
        return "max-w-[95vw] max-h-[95vh]";
      default:
        return "max-w-lg";
    }
  };

  // Get variant icon and colors
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          headerBg: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          headerBg: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case "danger":
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          headerBg: "bg-red-50",
          borderColor: "border-red-200",
        };
      case "info":
        return {
          icon: <Info className="w-5 h-5 text-blue-600" />,
          headerBg: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      default:
        return {
          icon: null,
          headerBg: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const variantStyles = getVariantStyles();

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`modal ${getSizeClasses()} ${className}`}
        onClick={handleModalClick}
      >
        {/* Header */}
        <div
          className={`modal-header ${variantStyles.headerBg} ${variantStyles.borderColor}`}
        >
          <div className="flex items-center gap-3">
            {variantStyles.icon}
            <h2 className="modal-title">{title}</h2>
          </div>
          {showCloseButton && (
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="modal-body">{children}</div>

        {/* Footer */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
