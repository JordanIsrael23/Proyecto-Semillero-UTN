import React, { useState } from "react";
import { ActividadCasa } from "../types";
import AppModal from "../../components/AppModal";

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
  const [subTab, setSubTab] = useState<"pendientes" | "completadas">("pendientes");
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [confirmModal, setConfirmModal] = useState<{
    title?: string;
    message: string;
    confirmLabel: string;
    variant?: "success" | "error" | "warning" | "info" | "danger";
    onConfirm: () => void;
  } | null>(null);

  const pendingTasks = actividadesCasa.filter((t) => !t.realizada);
  const completedTasks = actividadesCasa.filter((t) => t.realizada);
  const activeTasks = subTab === "pendientes" ? pendingTasks : completedTasks;

  return (
    <div className="space-y-6">
      {/* Selector de sub-pestañas */}
      <div className="flex gap-2 border-b border-outline-variant/20 pb-3">
        <button
          type="button"
          onClick={() => setSubTab("pendientes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === "pendientes"
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
          }`}
        >
          Pendientes ({pendingTasks.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab("completadas")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === "completadas"
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
          }`}
        >
          Completadas ({completedTasks.length})
        </button>
      </div>

      <div className="border p-6 rounded-2xl shadow-xl ds-card bg-surface-container-lowest">
        {activeTasks.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="text-3xl block mb-2">🏠</span>
            <p className="text-xs font-semibold">
              {subTab === "pendientes"
                ? "No tienes actividades pendientes de entrega."
                : "Aún no has completado ninguna actividad."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20 space-y-6">
            {activeTasks.map((task) => {
              const currentComment = comments[task.id] !== undefined
                ? comments[task.id]
                : (task.comentario_familia || "");

              const isWithinDeadline = !task.fecha_limite || new Date() <= new Date(task.fecha_limite);

              return (
                <div key={task.id} className="flex gap-4 pt-6 first:pt-0 items-start">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="rounded border border-outline-variant/30 bg-surface-container px-2 py-0.5 text-[9px] font-extrabold uppercase text-on-surface-variant">
                              {task.unidad_titulo}
                            </span>
                            {task.fecha_limite && (
                              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 tracking-wider">
                                📅 Límite: {new Date(task.fecha_limite).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            )}
                          </div>
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

                    {subTab === "pendientes" ? (
                      <div className="space-y-2 pt-2 border-t border-outline-variant/10">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Comentarios Familia / Reporte:</span>
                          <input
                            type="text"
                            placeholder="Escribe brevemente cómo le fue a tu hijo/a realizando esta tarea..."
                            value={currentComment}
                            onChange={(e) => setComments({ ...comments, [task.id]: e.target.value })}
                            className="ds-input w-full max-w-xl px-4 py-2 text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({
                              title: "Confirmar Respuesta",
                              message: "¿Seguro que quieres responder?",
                              confirmLabel: "Sí, responder",
                              variant: "info",
                              onConfirm: () => onToggleTask(task.id, true, currentComment)
                            });
                          }}
                          className="py-2 px-4 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
                        >
                          Marcar como Completada
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2 border-t border-outline-variant/10 text-xs">
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <div>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Reporte Entregado:</span>
                            <p className="italic text-on-surface mt-0.5">{task.comentario_familia || "Sin comentarios adicionales."}</p>
                            {task.fecha_realizacion && (
                              <p className="text-[10px] text-on-surface-variant/70 mt-1">
                                Completada el: <strong>{new Date(task.fecha_realizacion).toLocaleString()}</strong>
                              </p>
                            )}
                          </div>
                          <div className="self-end">
                            {isWithinDeadline ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmModal({
                                    title: "Volver a Responder",
                                    message: "¿Seguro que quieres volver a responder?",
                                    confirmLabel: "Sí, volver a responder",
                                    variant: "warning",
                                    onConfirm: () => {
                                      onToggleTask(task.id, false, currentComment);
                                      setSubTab("pendientes");
                                    }
                                  });
                                }}
                                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 border border-amber-500/30 text-amber-500 dark:text-amber-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow"
                              >
                                <span>🔄</span>
                                <span>Volver a Responder</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                title="El plazo para responder esta actividad ha expirado."
                                className="py-2 px-4 bg-outline-variant/20 text-on-surface-variant/40 rounded-xl text-xs font-bold cursor-not-allowed"
                              >
                                Plazo Vencido
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirmModal && (
        <AppModal
          open={!!confirmModal}
          type="confirm"
          variant={confirmModal.variant || "info"}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
        />
      )}
    </div>
  );
}
