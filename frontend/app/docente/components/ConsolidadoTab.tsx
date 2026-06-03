import React from "react";
import { Grupo, MetricaGrupal } from "../types";

interface ConsolidadoTabProps {
  selectedGroup: string;
  setSelectedGroup: (val: string) => void;
  grupos: Grupo[];
  metricasGrupales: MetricaGrupal[];
}

export const ConsolidadoTab: React.FC<ConsolidadoTabProps> = ({
  selectedGroup,
  setSelectedGroup,
  grupos,
  metricasGrupales,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">Métricas Colectivas</h2>
          <p className="text-xs text-on-surface-variant mt-1">Conteo consolidado de niveles de logro alcanzados por el grupo.</p>
        </div>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-full sm:w-[220px]"
        >
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
        </select>
      </div>

      {metricasGrupales.length === 0 ? (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl text-center py-20 text-on-surface-variant/80">
          <span className="text-4xl block mb-3">📈</span>
          <p className="text-sm font-bold">No se registran evaluaciones suficientes en este grupo para procesar métricas colectivas.</p>
        </div>
      ) : (
        <div className="space-y-6 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm sm:p-8">

          {metricasGrupales.some(m => m.iniciado > m.logrado) && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span><strong>Recomendación de Refuerzo:</strong> El grupo presenta áreas de oportunidad considerables. Se sugiere enfocar esfuerzos y materiales en los criterios con mayor porcentaje en nivel Iniciado.</span>
            </div>
          )}

          <div className="space-y-6">
            {metricasGrupales.map((met, idx) => {
              const total = met.iniciado + met.enProceso + met.logrado;
              const pctIniciado = total > 0 ? (met.iniciado / total) * 100 : 0;
              const pctProceso = total > 0 ? (met.enProceso / total) * 100 : 0;
              const pctLogrado = total > 0 ? (met.logrado / total) * 100 : 0;

              return (
                <div key={idx} className="space-y-2 border-b border-outline-variant/20 pb-5 last:border-0 last:pb-0">
                  <h4 className="text-sm font-bold text-on-surface">{met.criterio}</h4>
                  <div className="h-6 w-full bg-surface-container-lowest rounded-full overflow-hidden flex text-[10px] font-extrabold text-on-surface text-center">
                    {pctIniciado > 0 && (
                      <div className="bg-red-500 flex items-center justify-center transition-all" style={{ width: `${pctIniciado}%` }}>
                        {met.iniciado} Iniciado ({Math.round(pctIniciado)}%)
                      </div>
                    )}
                    {pctProceso > 0 && (
                      <div className="bg-amber-500 flex items-center justify-center transition-all" style={{ width: `${pctProceso}%` }}>
                        {met.enProceso} En Proceso ({Math.round(pctProceso)}%)
                      </div>
                    )}
                    {pctLogrado > 0 && (
                      <div className="bg-emerald-500 flex items-center justify-center transition-all" style={{ width: `${pctLogrado}%` }}>
                        {met.logrado} Logrado ({Math.round(pctLogrado)}%)
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 text-[10px] text-on-surface-variant/80 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" />Iniciado ({met.iniciado})</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />En Proceso ({met.enProceso})</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />Logrado ({met.logrado})</span>
                    <span className="ml-auto text-on-surface-variant">Total: {total} alumnos</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
