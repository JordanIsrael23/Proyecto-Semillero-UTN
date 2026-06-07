import React from "react";
import { ActividadCasa } from "../types";

interface TareasTabProps {
  actividadesCasa: ActividadCasa[];
  onToggleTask: (actId: string, realizada: boolean, comentario: string) => void;
}

const getEquivalenciaNota = (notaStr: string | null | undefined) => {
  if (!notaStr) return null;

  const nota = parseFloat(notaStr);
  if (!isNaN(nota)) {
    if (nota >= 8.0) {
      return { label: "Logrado", colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
    }
    if (nota >= 5.0) {
      return { label: "En Proceso", colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    }
    return { label: "Iniciado", colorClass: "bg-red-500/10 text-red-500 border-red-500/20" };
  }

  const clean = notaStr.toUpperCase().trim();
  if (clean === "L" || clean === "LOGRADO") {
    return { label: "Logrado", colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
  }
  if (clean === "EP" || clean === "EN PROCESO") {
    return { label: "En Proceso", colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
  }
  return { label: "Iniciado", colorClass: "bg-red-500/10 text-red-500 border-red-500/20" };
};

export default function TareasTab({ actividadesCasa, onToggleTask }: TareasTabProps) {
  return (
    <div className="space-y-6">
      <div className="border p-6 rounded-2xl shadow-xl ds-card bg-surface-container-lowest">
        {actividadesCasa.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="text-3xl block mb-2">🏠</span>
            <p className="text-xs font-semibold">No se registran tareas asignadas para la unidad activa.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20 space-y-6">
            {actividadesCasa.map((task) => (
              <div key={task.id} className="flex gap-4 pt-6 first:pt-0 items-start">
                <input
                  type="checkbox"
                  checked={task.realizada}
                  onChange={(e) => onToggleTask(task.id, e.target.checked, task.comentario_familia || "")}
                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-outline-variant/40 bg-surface-container-lowest text-primary focus:ring-primary"
                />
                <div className="flex-1 space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="rounded border border-outline-variant/30 bg-surface-container px-2 py-0.5 text-[9px] font-extrabold uppercase text-on-surface-variant">
                          {task.unidad_titulo}
                        </span>
                        <h4 className="font-extrabold text-base mt-2 text-on-surface">{task.titulo}</h4>
                      </div>
                      {task.nota && getEquivalenciaNota(task.nota) && (
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wider shrink-0 ${getEquivalenciaNota(task.nota)?.colorClass}`}>
                          Nota: {getEquivalenciaNota(task.nota)?.label}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-on-surface">{task.descripcion}</p>
                  </div>

                  {(() => {
                    let links: { titulo: string; url: string }[] = [];
                    if (task.recursos_enlaces) {
                      let parsed: any = null;
                      if (typeof task.recursos_enlaces === "string") {
                        try {
                          parsed = JSON.parse(task.recursos_enlaces);
                        } catch (e) {
                          parsed = null;
                        }
                      } else {
                        parsed = task.recursos_enlaces;
                      }

                      if (parsed) {
                        if (Array.isArray(parsed)) {
                          links = parsed;
                        } else if (typeof parsed === "object") {
                          if (parsed.titulo || parsed.url) {
                            links = [parsed];
                          } else {
                            links = Object.values(parsed);
                          }
                        }
                      }
                    }

                    // Asegurar que cada recurso tenga url
                    const validLinks = links.filter(
                      (rec) => rec && typeof rec === "object" && rec.url
                    );

                    if (validLinks.length === 0) return null;
                    return (
                      <div className="flex gap-2 flex-wrap pt-1">
                        {validLinks.map((rec, idx) => (
                          <a
                            key={idx}
                            href={rec.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-low py-1.5 px-3 text-[10px] font-extrabold text-primary transition-all hover:bg-surface-container"
                          >
                            <span>📄</span>
                            <span>{rec.titulo || "Recurso"}</span>
                          </a>
                        ))}
                      </div>
                    );
                  })()}

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Comentarios Familia / Reporte:</span>
                    <input
                      type="text"
                      placeholder="Escribe brevemente cómo le fue a tu hijo/a realizando esta tarea..."
                      defaultValue={task.comentario_familia || ""}
                      onBlur={(e) => {
                        if (e.target.value !== task.comentario_familia) {
                          onToggleTask(task.id, task.realizada, e.target.value);
                        }
                      }}
                      className="ds-input w-full max-w-xl px-4 py-2 text-xs"
                    />
                    {task.fecha_realizacion && (
                      <p className="text-[10px] text-on-surface-variant font-semibold pt-1">
                        Marcada realizada el: <strong>{new Date(task.fecha_realizacion).toLocaleString()}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
