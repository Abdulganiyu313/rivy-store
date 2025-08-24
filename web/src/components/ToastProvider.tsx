import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Toast.module.css";
import { _registerNotifier } from "../hooks/useToast";
import type { NotifierVariant } from "../hooks/useToast";

type ToastItem = { id: string; message: string; variant: NotifierVariant };
type Ctx = { notify: (variant: NotifierVariant, message: string) => void };

export const ToastContext = createContext<Ctx | null>(null);

const AUTO_DISMISS_MS = 2500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeouts = useRef<Record<string, number>>({});

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const tid = timeouts.current[id];
    if (tid) {
      clearTimeout(tid);
      delete timeouts.current[id];
    }
  }, []);

  const notify = useCallback(
    (variant: NotifierVariant, message: string) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      const tid = window.setTimeout(() => remove(id), AUTO_DISMISS_MS);
      timeouts.current[id] = tid;
    },
    [remove]
  );

  useEffect(() => {
    _registerNotifier(notify);
    return () => _registerNotifier(null);
  }, [notify]);

  const ctxValue = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={ctxValue}>
      {children}
      {createPortal(
        <div
          className={styles.container}
          role="region"
          aria-live="polite"
          aria-label="Notifications"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`${styles.toast} ${
                t.variant === "success" ? styles.success : styles.error
              }`}
              role="status"
            >
              <span className={styles.message}>{t.message}</span>
              <button
                type="button"
                className={styles.closeBtn}
                aria-label="Dismiss notification"
                onClick={() => remove(t.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
