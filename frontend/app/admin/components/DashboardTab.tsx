"use client";

import React from "react";
import MaterialIcon from "../../components/MaterialIcon";

interface DashboardTabProps {
  stats: {
    docentes: number;
    familias: number;
    grupos: number;
    estudiantes: number;
  };
  recentLogs: any[];
  loadingData: boolean;
  onRefresh: () => void;
}

export default function DashboardTab({
  stats,
  recentLogs,
  loadingData,
  onRefresh,
}: DashboardTabProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="ds-card p-6 flex items-center justify-between border-l-4 border-l-primary">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider block">Docentes Activos</span>
            <span className="text-3xl font-extrabold text-on-surface block mt-1">{stats.docentes}</span>
          </div>
          <div className="p-3 bg-primary/10 rounded-2xl text-primary text-2xl">
            <MaterialIcon name="school" />
          </div>
        </div>

        <div className="ds-card p-6 flex items-center justify-between border-l-4 border-l-highlight-orange">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider block">Familias Activas</span>
            <span className="text-3xl font-extrabold text-on-surface block mt-1">{stats.familias}</span>
          </div>
          <div className="p-3 bg-highlight-orange/10 rounded-2xl text-highlight-orange text-2xl">
            <MaterialIcon name="group" />
          </div>
        </div>

        <div className="ds-card p-6 flex items-center justify-between border-l-4 border-l-highlight-green">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider block">Grupos / Aulas</span>
            <span className="text-3xl font-extrabold text-on-surface block mt-1">{stats.grupos}</span>
          </div>
          <div className="p-3 bg-highlight-green/10 rounded-2xl text-highlight-green text-2xl">
            <MaterialIcon name="meeting_room" />
          </div>
        </div>

        <div className="ds-card p-6 flex items-center justify-between border-l-4 border-l-soft-blue">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider block">Estudiantes</span>
            <span className="text-3xl font-extrabold text-on-surface block mt-1">{stats.estudiantes}</span>
          </div>
          <div className="p-3 bg-soft-blue/10 rounded-2xl text-soft-blue text-2xl">
            <MaterialIcon name="child_care" />
          </div>
        </div>
      </div>

      {/* Bitácora de Auditoría */}
      <div className="ds-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface">Bitácora de Auditoría del Sistema</h3>
            <p className="text-xs text-on-surface-variant font-medium">Últimas 10 operaciones y cambios realizados en la base de datos</p>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer"
          >
            <MaterialIcon name="refresh" className="text-sm" />
            <span>Refrescar</span>
          </button>
        </div>

        {loadingData ? (
          <div className="text-center py-12">
            <MaterialIcon name="progress_activity" className="animate-spin text-3xl text-primary" />
            <span className="block mt-2 text-xs font-semibold text-on-surface-variant">Cargando registros...</span>
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <p className="text-sm font-semibold">No se encontraron logs de auditoría registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 text-on-surface-variant font-bold">
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Acción</th>
                  <th className="py-2.5 px-3">Tabla Afectada</th>
                  <th className="py-2.5 px-3">ID Registro</th>
                  <th className="py-2.5 px-3">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {recentLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-surface-container-low transition-colors text-on-surface">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {log.fecha_evento ? new Date(log.fecha_evento).toLocaleString() : "Sin fecha"}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[9px] ${
                        log.accion === "INSERT" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                        log.accion === "UPDATE" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                        "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-semibold">{log.tabla_afectada}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-on-surface-variant/80">{log.registro_id || "N/A"}</td>
                    <td className="py-2.5 px-3 max-w-[200px] truncate text-on-surface-variant" title={JSON.stringify(log.detalles_valores)}>
                      {typeof log.detalles_valores === "object"
                        ? JSON.stringify(log.detalles_valores)
                        : log.detalles_valores || "Sin detalles"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
