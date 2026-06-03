import React from "react";
import { Estudiante, FichaMonitoreo } from "../types";

interface MonitoreoTabProps {
  selectedStudent: Estudiante | null;
  setSelectedStudent: (val: Estudiante | null) => void;
  estudiantes: Estudiante[];
  fichaMonitoreo: FichaMonitoreo;
  setFichaMonitoreo: React.Dispatch<React.SetStateAction<FichaMonitoreo>>;
  handleSaveFicha: (e: React.FormEvent) => void;
}

export const MonitoreoTab: React.FC<MonitoreoTabProps> = ({
  selectedStudent,
  setSelectedStudent,
  estudiantes,
  fichaMonitoreo,
  setFichaMonitoreo,
  handleSaveFicha,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">Ficha de Monitoreo Individual</h2>
          <p className="text-xs text-on-surface-variant mt-1">Registra análisis cualitativos de los procesos cognitivos.</p>
        </div>
        <select
          value={selectedStudent?.id || ""}
          onChange={(e) => {
            const est = estudiantes.find((es) => es.id === e.target.value);
            if (est) setSelectedStudent(est);
          }}
          className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-full sm:w-[250px]"
        >
          <option value="">-- Selecciona Estudiante --</option>
          {estudiantes.map((est) => (
            <option key={est.id} value={est.id}>
              {est.apellido}, {est.nombre}
            </option>
          ))}
        </select>
      </div>

      {selectedStudent ? (
        <form onSubmit={handleSaveFicha} className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-on-surface border-b border-outline-variant/20 pb-3">
            Estudiante: <span className="text-primary">{selectedStudent.nombre} {selectedStudent.apellido}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Clasificación</label>
              <textarea
                required
                value={fichaMonitoreo.clasificacion}
                onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, clasificacion: e.target.value })}
                placeholder="Descripción sobre cómo agrupa objetos según atributos (forma, color, etc.)"
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Seriación</label>
              <textarea
                required
                value={fichaMonitoreo.seriacion}
                onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, seriacion: e.target.value })}
                placeholder="Descripción sobre la habilidad de ordenar elementos de manera secuencial."
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Asimilación y Acomodación</label>
              <textarea
                required
                value={fichaMonitoreo.asimilacion_acomodacion}
                onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, asimilacion_acomodacion: e.target.value })}
                placeholder="Descripción de la apropiación y reestructuración de esquemas mentales."
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Justificación Lógica</label>
              <textarea
                required
                value={fichaMonitoreo.justificacion_logica}
                onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, justificacion_logica: e.target.value })}
                placeholder="Cómo expresa lógicamente la causa o razón de sus respuestas y acciones."
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Autorregulación</label>
              <textarea
                required
                value={fichaMonitoreo.autorregulacion}
                onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, autorregulacion: e.target.value })}
                placeholder="Capacidad del menor de guiar y coordinar sus propias conductas."
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Observaciones del Docente</label>
              <textarea
                value={fichaMonitoreo.observaciones || ""}
                onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, observaciones: e.target.value })}
                placeholder="Notas adicionales e incidencias observadas."
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Acciones de Apoyo Recomendadas (Para Docente y Familia)</label>
            <textarea
              value={fichaMonitoreo.acciones_apoyo || ""}
              onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, acciones_apoyo: e.target.value })}
              placeholder="Dinámicas sugeridas de apoyo escolar que deben implementarse en el aula y en casa."
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[80px]"
            />
          </div>

          <div className="flex justify-end border-t border-outline-variant/20 pt-5 mt-4">
            <button
              type="submit"
              className="py-3 px-6 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              Guardar Ficha de Monitoreo
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl text-center py-20 text-on-surface-variant/80">
          <span className="text-4xl block mb-3">📊</span>
          <p className="text-sm font-bold">Por favor, selecciona un Estudiante para llenar la Ficha de Monitoreo.</p>
        </div>
      )}
    </div>
  );
};
