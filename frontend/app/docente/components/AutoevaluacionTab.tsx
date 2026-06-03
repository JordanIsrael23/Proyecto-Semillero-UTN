import React from "react";
import { UnidadDidactica } from "../types";

interface AutoevaluacionTabProps {
  selectedUnit: string;
  setSelectedUnit: (val: string) => void;
  unidades: UnidadDidactica[];
  autoevaluacionAnswers: { [qNum: number]: "SI" | "NO" | "EP" };
  setAutoevaluacionAnswers: React.Dispatch<React.SetStateAction<{ [qNum: number]: "SI" | "NO" | "EP" }>>;
  autoevaluacionReflexion: string;
  setAutoevaluacionReflexion: (val: string) => void;
  handleSaveAutoevaluacion: (e: React.FormEvent) => void;
}

export const AutoevaluacionTab: React.FC<AutoevaluacionTabProps> = ({
  selectedUnit,
  setSelectedUnit,
  unidades,
  autoevaluacionAnswers,
  setAutoevaluacionAnswers,
  autoevaluacionReflexion,
  setAutoevaluacionReflexion,
  handleSaveAutoevaluacion,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">Autoevaluación Docente</h2>
          <p className="text-xs text-on-surface-variant mt-1">Reflexiona y evalúa tu práctica en la unidad didáctica.</p>
        </div>
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-full sm:w-[250px]"
        >
          <option value="">-- Selecciona Unidad --</option>
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>
              {u.titulo}
            </option>
          ))}
        </select>
      </div>

      {selectedUnit ? (
        <form onSubmit={handleSaveAutoevaluacion} className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-on-surface border-b border-outline-variant/20 pb-3">
            Formulario Pedagógico de Autoevaluación
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { num: 1, text: "1. ¿Las actividades permitieron el desarrollo cognitivo planteado?" },
              { num: 2, text: "2. ¿Los recursos didácticos facilitaron la asimilación y acomodación?" },
              { num: 3, text: "3. ¿Las rúbricas aplicadas permitieron medir el logro individual?" },
              { num: 4, text: "4. ¿El tiempo estipulado para la unidad didáctica fue suficiente?" },
              { num: 5, text: "5. ¿La comunicación y actividades en casa fueron apoyadas por la familia?" },
              { num: 6, text: "6. ¿Se implementaron las adecuaciones curriculares necesarias?" }
            ].map((q) => (
              <div key={q.num} className="space-y-2">
                <span className="text-xs font-bold text-on-surface-variant block">{q.text}</span>
                <select
                  value={autoevaluacionAnswers[q.num]}
                  onChange={(e) => setAutoevaluacionAnswers({ ...autoevaluacionAnswers, [q.num]: e.target.value as any })}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary w-full"
                >
                  <option value="SI">Sí</option>
                  <option value="NO">No</option>
                  <option value="EP">En Proceso</option>
                </select>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-xs font-bold text-on-surface-variant block">Reflexión Pedagógica y Propuestas de Mejora</label>
            <textarea
              required
              value={autoevaluacionReflexion}
              onChange={(e) => setAutoevaluacionReflexion(e.target.value)}
              placeholder="Escriba sus comentarios reflexivos pedagógicos..."
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
            />
          </div>

          <div className="flex justify-end border-t border-outline-variant/20 pt-5 mt-4">
            <button
              type="submit"
              className="py-3 px-6 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              Registrar Autoevaluación
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl text-center py-20 text-on-surface-variant/80">
          <span className="text-4xl block mb-3">🍎</span>
          <p className="text-sm font-bold">Por favor, selecciona una Unidad para completar tu autoevaluación.</p>
        </div>
      )}
    </div>
  );
};
