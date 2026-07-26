"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { IconAlertCircle, IconCheckCircle, IconX } from "./icons";

type ToastType = "success" | "error";
type Toast = { id: number; type: ToastType; message: string };

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

// Errors stay up longer — they're usually longer to read and worth not missing.
const DURATION: Record<ToastType, number> = { success: 4000, error: 7000 };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = ++nextId.current;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismiss(id), DURATION[type]);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    success: (message) => push("success", message),
    error: (message) => push("error", message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="animate-fade-up flex items-start gap-3 rounded-lg border border-border bg-white p-4 text-xs shadow-lg"
          >
            {t.type === "success" ? (
              <IconCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#006300]" />
            ) : (
              <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#d03b3b]" />
            )}
            <p className="flex-1 leading-relaxed text-text">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 text-text-faint transition-colors hover:text-text"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
