"use client";

import React from "react";
import MaterialIcon from "../../components/MaterialIcon";

interface GenericEditModalProps {
  open: boolean;
  tableName: string;
  record: any;
  genericForm: any;
  onFormChange: (form: any) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function GenericEditModal({
  open,
  tableName,
  record,
  genericForm,
  onFormChange,
  onClose,
  onSubmit,
}: GenericEditModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-black/55 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="ds-modal relative w-full max-w-xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-5">
            <div>
              <h3 className="font-headline text-base font-bold text-on-surface">
                Editar Fila en la BDD
              </h3>
              <span className="text-[10px] font-mono text-primary">{tableName}</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
            >
              <MaterialIcon name="close" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(record).map((key) => {
                const isReadOnly =
                  key === "id" ||
                  key === "clave" ||
                  key === "usuario_id" ||
                  key.startsWith("fecha_") ||
                  key === "fecha_creacion" ||
                  key === "fecha_actualizacion" ||
                  key === "fecha_evento" ||
                  key === "fecha_modificacion";

                const currentValue = genericForm[key];

                return (
                  <div key={key} className={`space-y-1 ${isReadOnly ? "opacity-60" : ""}`}>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                      {key} {isReadOnly && <span className="text-[9px] font-normal lowercase">(no editable)</span>}
                    </label>

                    {isReadOnly ? (
                      <div className="bg-surface-container-low px-3 py-2 rounded-xl text-xs font-mono break-all text-on-surface-variant select-all">
                        {currentValue !== null && currentValue !== undefined
                          ? currentValue.toString()
                          : "null"}
                      </div>
                    ) : typeof currentValue === "boolean" ? (
                      <div className="flex items-center gap-2 py-2">
                        <input
                          type="checkbox"
                          checked={!!currentValue}
                          onChange={(e) => onFormChange({ ...genericForm, [key]: e.target.checked })}
                          className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-xs font-medium text-on-surface">Activo / Confirmado</span>
                      </div>
                    ) : key === "estado" ? (
                      <select
                        value={currentValue || ""}
                        onChange={(e) => onFormChange({ ...genericForm, [key]: e.target.value })}
                        className="ds-input w-full px-3 py-2 text-xs"
                      >
                        <option value="borrador">Borrador</option>
                        <option value="activo">Activo</option>
                        <option value="archivado">Archivado</option>
                      </select>
                    ) : key === "tipo" ? (
                      <select
                        value={currentValue || ""}
                        onChange={(e) => onFormChange({ ...genericForm, [key]: e.target.value })}
                        className="ds-input w-full px-3 py-2 text-xs"
                      >
                        <option value="clase">Clase</option>
                        <option value="casa">Casa</option>
                      </select>
                    ) : key === "app_criterio" ? (
                      <select
                        value={currentValue || ""}
                        onChange={(e) => onFormChange({ ...genericForm, [key]: e.target.value })}
                        className="ds-input w-full px-3 py-2 text-xs"
                      >
                        <option value="Caracterizar">Caracterizar</option>
                        <option value="Clasificar">Clasificar</option>
                        <option value="Seriar">Seriar</option>
                        <option value="Rompecabezas">Rompecabezas</option>
                      </select>
                    ) : key === "respuesta" ? (
                      <select
                        value={currentValue || ""}
                        onChange={(e) => onFormChange({ ...genericForm, [key]: e.target.value })}
                        className="ds-input w-full px-3 py-2 text-xs"
                      >
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                        <option value="EP">EP</option>
                      </select>
                    ) : key === "fecha_nacimiento" || key === "fecha_limite" || key === "fecha_realizacion" || key === "fecha_sesion" || key === "fecha_evaluacion" ? (
                      <input
                        type="datetime-local"
                        value={
                          currentValue
                            ? new Date(currentValue).toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={(e) => onFormChange({ ...genericForm, [key]: e.target.value })}
                        className="ds-input w-full px-3 py-2 text-xs"
                      />
                    ) : typeof currentValue === "object" ? (
                      <textarea
                        value={JSON.stringify(currentValue)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            onFormChange({ ...genericForm, [key]: parsed });
                          } catch {
                            // Dejar que sigan escribiendo hasta que el JSON sea válido
                          }
                        }}
                        className="ds-input w-full px-3 py-2 text-xs font-mono"
                        rows={3}
                      />
                    ) : (
                      <input
                        type="text"
                        value={currentValue !== null && currentValue !== undefined ? currentValue : ""}
                        onChange={(e) => onFormChange({ ...genericForm, [key]: e.target.value })}
                        className="ds-input w-full px-3 py-2 text-xs font-mono"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-outline-variant/20 justify-end">
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
                Guardar Registro
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
