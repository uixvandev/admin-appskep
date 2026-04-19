import React, { useMemo } from "react";
import { Modal as HeroModal } from "@heroui/react";
import { useOverlayTriggerState } from "@react-stately/overlays";

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
  const state = useOverlayTriggerState({
    isOpen,
    onOpenChange: (open: boolean) => {
      if (!open) onClose();
    },
  });

  const toneClasses =
    variant === "success"
      ? "border-[color:var(--success)]/30"
      : variant === "warning"
        ? "border-[color:var(--warning)]/40"
        : variant === "danger"
          ? "border-[color:var(--danger)]/40"
          : variant === "info"
            ? "border-[color:var(--accent)]/40"
            : "";

  const sizeVariant = size === "xl" ? "lg" : size;

  const keyboardDismissDisabled = useMemo(
    () => !closeOnEscape,
    [closeOnEscape],
  );

  if (!isOpen) return null;

  return (
    <HeroModal state={state}>
      <HeroModal.Backdrop
        variant="opaque"
        className="bg-black/70"
        isDismissable={closeOnOverlayClick}
        isKeyboardDismissDisabled={keyboardDismissDisabled}
      >
        <HeroModal.Container size={sizeVariant}>
          <HeroModal.Dialog className={`${toneClasses} ${className}`.trim()}>
            {showCloseButton && <HeroModal.CloseTrigger />}
            <HeroModal.Header>
              <HeroModal.Heading>{title}</HeroModal.Heading>
            </HeroModal.Header>
            <HeroModal.Body>{children}</HeroModal.Body>
            {footer && <HeroModal.Footer>{footer}</HeroModal.Footer>}
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  );
};

export default Modal;
