import React from "react";
import { Estudiante } from "../types";

interface GradeTasksModalProps {
  showGradeTasksModal: boolean;
  setShowGradeTasksModal: (val: boolean) => void;
  selectedStudentForTasks: Estudiante | null;
  setSelectedStudentForTasks: (val: Estudiante | null) => void;
  studentTasks: any[];
  setStudentTasks: (tasks: any[]) => void;
  loadingTasks: boolean;
  savingTaskGradeId: string | null;
  handleGradeChangeLocal: (activityId: string, val: string) => void;
  handleSaveGrade: (activityId: string, val: string) => void;
}

export const GradeTasksModal: React.FC<GradeTasksModalProps> = ({
  showGradeTasksModal,
  setShowGradeTasksModal,
  selectedStudentForTasks,
  setSelectedStudentForTasks,
  studentTasks,
  setStudentTasks,
  loadingTasks,
  savingTaskGradeId,
  handleGradeChangeLocal,
  handleSaveGrade,
}) => {
  if (!showGradeTasksModal || !selectedStudentForTasks) return null;

  return (
    <div className="ds-modal-overlay fixed inset-0 z-50 flex animate-fade-in items-center justify-center p-4 backdrop-blur-sm">
      <div className="ds-modal relative max-w-2xl w-full space-y-6 p-6 sm:p-8">
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Calificar Tareas en Casa</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Estudiante: <strong className="text-primary">{selectedStudentForTasks.nombre} {selectedStudentForTasks.apellido}</strong>
            </p>
          </div>
          <button
            onClick={() => {
              setShowGradeTasksModal(false);
              setSelectedStudentForTasks(null);
              setStudentTasks([]);
            }}
            className="text-on-surface-variant/80 hover:text-on-surface cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        {loadingTasks ? (
          <div className="py-12 text-center text-on-surface-variant/70 text-sm font-semibold animate-pulse">
            Cargando actividades y tareas del estudiante...
          </div>
        ) : studentTasks.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant/70 text-sm font-semibold">
            No hay actividades de casa asignadas para este estudiante en las unidades activas.
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-4 pr-1">
            {studentTasks.map((task) => (
              <div key={task.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 space-y-3 shadow-md hover:border-outline-variant/40 transition-all">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="rounded border border-outline-variant/30 bg-surface-container px-2 py-0.5 text-[9px] font-extrabold uppercase text-on-surface-variant">
                      {task.unidad_titulo}
                    </span>
                    <h4 className="text-sm font-bold text-on-surface mt-1">{task.titulo}</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{task.descripcion}</p>
                  </div>

                  {/* Control de Calificación */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Calificación (0 - 10)</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        placeholder="Ej: 8.5"
                        value={task.nota !== null && task.nota !== undefined ? task.nota : ""}
                        onChange={(e) => handleGradeChangeLocal(task.id, e.target.value)}
                        onBlur={(e) => handleSaveGrade(task.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="w-24 bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary font-semibold text-center"
                      />
                      {savingTaskGradeId === task.id ? (
                        <span className="text-[10px] text-primary animate-pulse font-bold">...</span>
                      ) : task.nota ? (
                        <span className="text-xs text-green-400 font-bold" title="Guardado exitosamente">✓</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-2 border-t border-outline-variant/10 pt-3 text-[11px] text-on-surface-variant">
                  <div>
                    <span className="font-semibold text-on-surface-variant/80 uppercase block text-[9px]">Cumplimiento:</span>
                    <span className={`font-bold ${task.realizada ? "text-green-400" : "text-amber-400"}`}>
                      {task.realizada ? "✓ Entregada" : "✗ Pendiente"}
                    </span>
                    {task.fecha_realizacion && (
                      <span className="text-[10px] text-on-surface-variant/60 ml-1.5">
                        ({new Date(task.fecha_realizacion).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                  <div className="flex-1 max-w-md sm:text-right">
                    <span className="font-semibold text-on-surface-variant/80 uppercase block text-[9px]">Comentario del Representante:</span>
                    <span className="italic block mt-0.5 truncate text-on-surface">
                      {task.comentario_familia || "Sin comentarios"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={() => {
              setShowGradeTasksModal(false);
              setSelectedStudentForTasks(null);
              setStudentTasks([]);
            }}
            className="py-2 px-6 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
