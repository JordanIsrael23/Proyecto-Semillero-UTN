"use client";

import React from "react";
import MaterialIcon from "../../components/MaterialIcon";

interface UserModalProps {
  open: boolean;
  type: "create" | "edit";
  rol: "docente" | "familia";
  userForm: {
    cedula: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    password_raw: string;
    extraField: string;
  };
  onFormChange: (form: any) => void;
  error: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function UserModal({
  open,
  type,
  rol,
  userForm,
  onFormChange,
  error,
  onClose,
  onSubmit,
}: UserModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-black/55 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="ds-modal relative w-full max-w-lg p-6 sm:p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-5">
            <h3 className="font-headline text-lg font-bold text-on-surface">
              {type === "create" ? "Crear Nuevo Usuario" : "Editar Usuario"}{" "}
              <span className="text-primary capitalize">({rol})</span>
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
            >
              <MaterialIcon name="close" />
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 p-3.5 text-xs font-semibold text-error">
              <MaterialIcon name="error" className="shrink-0 text-base" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Cédula</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 1004954321"
                  value={userForm.cedula}
                  onChange={(e) => onFormChange({ ...userForm, cedula: e.target.value })}
                  className="ds-input w-full px-3.5 py-2 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="correo@ejemplo.com"
                  value={userForm.email}
                  onChange={(e) => onFormChange({ ...userForm, email: e.target.value })}
                  className="ds-input w-full px-3.5 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ingrese nombre"
                  value={userForm.nombre}
                  onChange={(e) => onFormChange({ ...userForm, nombre: e.target.value })}
                  className="ds-input w-full px-3.5 py-2 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Apellido</label>
                <input
                  type="text"
                  required
                  placeholder="Ingrese apellido"
                  value={userForm.apellido}
                  onChange={(e) => onFormChange({ ...userForm, apellido: e.target.value })}
                  className="ds-input w-full px-3.5 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Teléfono</label>
                <input
                  type="text"
                  placeholder="Ej: 0991234567"
                  value={userForm.telefono}
                  onChange={(e) => onFormChange({ ...userForm, telefono: e.target.value })}
                  className="ds-input w-full px-3.5 py-2 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  {rol === "docente" ? "Especialidad" : "Dirección de Domicilio"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={rol === "docente" ? "Ej: Educación Inicial" : "Ej: Sector El Olivo"}
                  value={userForm.extraField}
                  onChange={(e) => onFormChange({ ...userForm, extraField: e.target.value })}
                  className="ds-input w-full px-3.5 py-2 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Contraseña {type === "edit" && <span className="text-[9px] text-on-surface-variant/60 font-normal lowercase">(dejar vacío para conservar actual)</span>}
              </label>
              <input
                type="password"
                placeholder="Min 6 caracteres"
                value={userForm.password_raw}
                onChange={(e) => onFormChange({ ...userForm, password_raw: e.target.value })}
                className="ds-input w-full px-3.5 py-2 text-xs"
              />
            </div>

            <div className="flex gap-3 pt-4 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="ds-btn-primary px-5 py-2.5 text-xs shadow-md cursor-pointer hover:scale-[1.01]"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
