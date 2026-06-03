import React from "react";
import { HijoRel } from "../types";

interface HijoCardProps {
  selectedHijo: HijoRel;
}

export default function HijoCard({ selectedHijo }: HijoCardProps) {
  return (
    <div className="border p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-xl relative overflow-hidden ds-card bg-surface-container-lowest">
      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
      <div>
        <span className="rounded-md border border-tertiary-container/40 bg-tertiary-container/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-tertiary">
          Estudiante
        </span>
        <h3 className="text-lg font-extrabold mt-2 text-on-surface">
          {selectedHijo.estudiante?.nombre} {selectedHijo.estudiante?.apellido}
        </h3>
        <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">C.I.: {selectedHijo.estudiante?.cedula || "N/A"}</p>
      </div>
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">
          Aula / Semillero
        </span>
        <p className="text-sm font-bold mt-2 text-on-surface">{selectedHijo.grupo?.nombre || "No asignado"}</p>
      </div>
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">
          Docente Responsable
        </span>
        <p className="text-sm font-bold mt-2 text-on-surface">
          {selectedHijo.docente?.nombre} {selectedHijo.docente?.apellido}
        </p>
      </div>
    </div>
  );
}
