import { Toast } from "@heroui/react";

export default function ToastProvider() {
  return <Toast.Provider placement="top end" className="z-[10000]" />;
}
