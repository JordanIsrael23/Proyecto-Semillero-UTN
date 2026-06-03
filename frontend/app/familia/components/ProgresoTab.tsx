import React from "react";
import { EvaluacionCriterio, FichaMonitoreo } from "../types";

interface ProgresoTabProps {
  hijoProgreso: EvaluacionCriterio[];
  hijoFicha: FichaMonitoreo | null;
}

export default function ProgresoTab({ hijoProgreso, hijoFicha }: ProgresoTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-on-surface">Rúbrica Cognitiva</h3>
        {hijoProgreso.length === 0 ? (
          <div className="border rounded-2xl py-12 text-center ds-card text-on-surface-variant bg-surface-container-lowest">
            <span className="text-3xl block mb-2">📈</span>
            <p className="text-xs font-semibold">El docente a cargo aún no ha registrado evaluaciones cognitivas para el menor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hijoProgreso.map((prog) => {
              const code = prog.niveles_logro?.codigo;
              let cardBorder = "border-outline-variant/30 hover:border-primary/30";
              let badgeClass = "bg-surface-container text-on-surface-variant border-outline-variant/30";

              if (code === "I") {
                cardBorder = "border-red-500/30 hover:border-red-500/50";
                badgeClass = "bg-red-500/10 text-red-500 border-red-500/20";
              } else if (code === "EP") {
                cardBorder = "border-amber-500/30 hover:border-amber-500/50";
                badgeClass = "bg-amber-500/10 text-amber-600 border-amber-500/20";
              } else if (code === "L") {
                cardBorder = "border-emerald-500/30 hover:border-emerald-500/50";
                badgeClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
              }

              return (
                <div key={prog.id} className={`flex flex-col justify-between rounded-2xl border bg-surface-container-lowest p-6 shadow-xl transition-all ${cardBorder}`}>
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-extrabold text-base text-on-surface">{prog.criterios_evaluacion?.nombre}</h4>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wider shrink-0 ${badgeClass}`}>
                        {prog.niveles_logro?.nombre}
                      </span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase mt-2">
                      Unidad: {prog.unidades_didacticas?.titulo || "N/A"}
                    </p>
                  </div>
                  <div className="mt-4 rounded-xl border border-outline-variant/20 bg-surface-container-low p-4 text-xs leading-relaxed text-on-surface-variant">
                    <span className="font-bold text-on-surface-variant uppercase tracking-wider block text-[10px] mb-1">Observaciones del Educador:</span>
                    {prog.observaciones || "El menor muestra buena actitud y disponibilidad durante la evaluación."}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ficha Cualitativa de Monitoreo */}
      {hijoFicha && (
        <div className="border p-6 sm:p-8 rounded-2xl space-y-6 ds-card shadow-sm bg-surface-container-lowest">
          <h3 className="border-b border-outline-variant/20 pb-3 text-base font-extrabold text-on-surface">
            Ficha Cualitativa de Monitoreo Individual
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {[
              { label: "Clasificación", text: hijoFicha.clasificacion },
              { label: "Seriación", text: hijoFicha.seriacion },
              { label: "Asimilación y Acomodación", text: hijoFicha.asimilacion_acomodacion },
              { label: "Justificación Lógica", text: hijoFicha.justificacion_logica },
              { label: "Autorregulación", text: hijoFicha.autorregulacion },
              { label: "Observaciones Generales", text: hijoFicha.observaciones || "Sin observaciones." }
            ].map((f, i) => (
              <div key={i} className="space-y-1 rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{f.label}</h4>
                <p className="mt-1 text-xs leading-relaxed text-on-surface">{f.text}</p>
              </div>
            ))}
          </div>

          {hijoFicha.acciones_apoyo && (
            <div className="mt-4 space-y-1 border-t border-outline-variant/20 pt-5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-tertiary">Acciones de Apoyo Recomendadas para el Hogar</h4>
              <p className="text-xs font-bold leading-relaxed text-on-surface">{hijoFicha.acciones_apoyo}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
