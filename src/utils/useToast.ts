import { useCallback } from "react";
import { toast } from "@heroui/react";

export function useToast() {
  const showToast = useCallback(
    (
      message: string,
      variant:
        | "default"
        | "accent"
        | "success"
        | "warning"
        | "danger" = "default",
    ) => {
      toast(message, { variant });
    },
    [],
  );

  const showSuccess = useCallback(
    (message: string) => {
      showToast(message, "success");
    },
    [showToast],
  );

  const showError = useCallback(
    (message: string) => {
      showToast(message, "danger");
    },
    [showToast],
  );

  const showWarning = useCallback(
    (message: string) => {
      showToast(message, "warning");
    },
    [showToast],
  );

  const showInfo = useCallback(
    (message: string) => {
      showToast(message, "accent");
    },
    [showToast],
  );

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
