import { useContext } from "react";
import { ToastContext } from "../components/ToastProvider";

export type NotifierVariant = "success" | "error";
type Notifier = (variant: NotifierVariant, message: string) => void;

let _notifier: Notifier | null = null;

// wired by ToastProvider
export function _registerNotifier(fn: Notifier | null) {
  _notifier = fn;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: (msg: string) =>
        _notifier ? _notifier("success", msg) : console.warn("Toast:", msg),
      error: (msg: string) =>
        _notifier ? _notifier("error", msg) : console.warn("Toast:", msg),
    };
  }
  return {
    success: (msg: string) => ctx.notify("success", msg),
    error: (msg: string) => ctx.notify("error", msg),
  };
}

export const toast = {
  success: (msg: string) =>
    _notifier ? _notifier("success", msg) : console.warn("Toast:", msg),
  error: (msg: string) =>
    _notifier ? _notifier("error", msg) : console.warn("Toast:", msg),
};
