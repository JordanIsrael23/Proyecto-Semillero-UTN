"use client";

import { useEffect, useRef } from "react";

//AppModal – reemplaza window.alert() y window.confirm()


type ModalVariant = "success" | "error" | "warning" | "info" | "danger";
type ModalType = "alert" | "confirm";

interface AppModalProps {
  open: boolean;
  type?: ModalType;
  variant?: ModalVariant;
  title?: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ICONS: Record<ModalVariant, string> = {
  success: "check_circle",
  error: "error",
  warning: "warning",
  info: "info",
  danger: "delete_forever",
};

const COLORS: Record<ModalVariant, { icon: string; btn: string; border: string }> = {
  success: {
    icon: "text-emerald-500",
    btn: "bg-emerald-500 hover:bg-emerald-600 text-white",
    border: "border-emerald-500/20",
  },
  error: {
    icon: "text-red-500",
    btn: "bg-red-500 hover:bg-red-600 text-white",
    border: "border-red-500/20",
  },
  warning: {
    icon: "text-amber-500",
    btn: "bg-amber-500 hover:bg-amber-600 text-white",
    border: "border-amber-500/20",
  },
  info: {
    icon: "text-blue-400",
    btn: "bg-blue-500 hover:bg-blue-600 text-white",
    border: "border-blue-500/20",
  },
  danger: {
    icon: "text-red-500",
    btn: "bg-red-500 hover:bg-red-600 text-white",
    border: "border-red-500/20",
  },
};

export default function AppModal({
  open,
  type = "alert",
  variant = "info",
  title,
  message,
  onClose,
  onConfirm,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
}: AppModalProps) {
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  // Foco automático al abrir y cierre con Escape
  useEffect(() => {
    if (!open) return;
    primaryBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const colors = COLORS[variant];
  const icon = ICONS[variant];
  const defaultTitle =
    variant === "success"
      ? "¡Operación exitosa!"
      : variant === "error"
        ? "Ha ocurrido un error"
        : variant === "warning"
          ? "Atención"
          : variant === "danger"
            ? "Confirmar acción"
            : "Información";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        <div
          className={`relative w-full max-w-sm rounded-3xl border bg-surface-container-lowest shadow-2xl shadow-black/30 transition-all ${colors.border}`}
          style={{ animation: "modalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con ícono */}
          <div className="flex flex-col items-center gap-3 px-8 pt-8 pb-4 text-center">
            <span className={`material-symbols-rounded text-5xl ${colors.icon}`}>
              {icon}
            </span>
            <h2
              id="app-modal-title"
              className="text-base font-extrabold text-on-surface leading-snug"
            >
              {title ?? defaultTitle}
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {message}
            </p>
          </div>

          {/* Acciones */}
          <div
            className={`flex gap-3 px-6 pb-6 pt-2 ${type === "confirm" ? "flex-row justify-end" : "flex-col"
              }`}
          >
            {type === "confirm" && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-outline-variant/40 bg-surface-container px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-high"
              >
                {cancelLabel}
              </button>
            )}
            <button
              ref={primaryBtnRef}
              type="button"
              onClick={() => {
                if (type === "confirm" && onConfirm) onConfirm();
                onClose();
              }}
              className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all shadow-md ${colors.btn}`}
            >
              {type === "confirm" ? confirmLabel : "Entendido"}
            </button>
          </div>
        </div>
      </div>

      {/* Animación */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.88) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
