import React from "react";
import { EvaluacionCriterio } from "../types";

interface HistorialTabProps {
  hijoProgreso: EvaluacionCriterio[];
}

export default function HistorialTab({ hijoProgreso }: HistorialTabProps) {
  return (
    <div className="border p-6 rounded-2xl shadow-xl space-y-6 ds-card bg-surface-container-lowest">
      <h3 className="border-b border-outline-variant/20 pb-3 text-base font-extrabold text-on-surface">Línea de Tiempo del Progreso</h3>
      {hijoProgreso.length === 0 ? (
        <div className="text-center py-6 text-on-surface-variant">
          <p className="text-xs font-semibold">No se encontraron registros de avance para graficar la evolución histórica.</p>
        </div>
      ) : (
        <div className="relative border-l ml-4 pl-6 space-y-6 border-outline-variant/30">
          {hijoProgreso.map((prog) => (
            <div key={prog.id} className="relative">
              <div className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
              <div className="space-y-1 rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                <span className="text-[10px] text-on-surface-variant font-mono block">Evaluación de la Unidad</span>
                <h4 className="font-bold text-sm text-on-surface">{prog.criterios_evaluacion?.nombre}</h4>
                <p className="text-xs font-semibold text-primary">{prog.unidades_didacticas?.titulo || "Unidad de Aprendizaje"}</p>
                <div className="pt-2 flex items-center gap-4 text-xs">
                  <p><span className="text-on-surface-variant">Logro:</span> <strong className="text-highlight-green">{prog.niveles_logro?.nombre || "N/A"}</strong></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
