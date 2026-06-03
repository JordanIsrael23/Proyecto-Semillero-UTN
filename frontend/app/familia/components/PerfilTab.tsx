import React from "react";
import { HijoRel } from "../types";

interface PerfilTabProps {
  selectedHijo: HijoRel;
}

export default function PerfilTab({ selectedHijo }: PerfilTabProps) {
  return (
    <div className="border p-6 rounded-2xl shadow-xl space-y-6 ds-card bg-surface-container-lowest">
      {/* Encabezado: Especifica de quién son los datos */}
      <div className="flex items-center space-x-4 border-b border-outline-variant/20 pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-extrabold text-on-surface">Perfil del Estudiante</h3>
          <p className="text-xs text-on-surface-variant">
            Visualizando la información académica y personal de: <span className="font-bold text-primary">{selectedHijo.estudiante?.nombre} {selectedHijo.estudiante?.apellido}</span>
          </p>
        </div>
      </div>

      {/* Cuadro Único de Datos */}
      <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex flex-col space-y-1">
            <span className="font-semibold text-on-surface-variant/80 uppercase tracking-wider text-[10px]">Nombres completos</span>
            <strong className="text-sm font-medium text-on-surface">
              {selectedHijo.estudiante?.nombre || "N/A"} {selectedHijo.estudiante?.apellido || ""}
            </strong>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="font-semibold text-on-surface-variant/80 uppercase tracking-wider text-[10px]">Cédula de Identidad</span>
            <strong className="text-sm font-mono text-on-surface">
              {selectedHijo.estudiante?.cedula || "N/A"}
            </strong>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="font-semibold text-on-surface-variant/80 uppercase tracking-wider text-[10px]">Semillero Asignado</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary w-fit mt-0.5">
              {selectedHijo.grupo?.nombre || "No asignado"}
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="font-semibold text-on-surface-variant/80 uppercase tracking-wider text-[10px]">Fecha de Nacimiento</span>
            <strong className="text-sm font-medium text-on-surface">
              {selectedHijo.estudiante?.fecha_nacimiento
                ? new Date(selectedHijo.estudiante.fecha_nacimiento).toLocaleDateString()
                : "No registrada"}
            </strong>
          </div>

          <div className="flex flex-col space-y-1 sm:col-span-2 border-t border-outline-variant/10 pt-3 mt-1">
            <span className="font-semibold text-on-surface-variant/80 uppercase tracking-wider text-[10px]">Parentesco / Relación</span>
            <strong className="text-sm font-medium text-on-surface">
              {selectedHijo.parentesco || "Representado"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
