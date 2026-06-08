"use client";

import React from "react";
import MaterialIcon from "../../components/MaterialIcon";

interface DatabaseTabProps {
  tables: string[];
  selectedTable: string;
  onSelectTable: (table: string) => void;
  tableRecords: any[];
  loadingData: boolean;
  onEditRecord: (record: any) => void;
  onDeleteRecord: (record: any) => void;
}

export default function DatabaseTab({
  tables,
  selectedTable,
  onSelectTable,
  tableRecords,
  loadingData,
  onEditRecord,
  onDeleteRecord,
}: DatabaseTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-outline-variant/20 pb-4">
        <h3 className="font-headline text-lg font-bold text-on-surface">Explorador & Editor de Base de Datos</h3>
        <p className="text-xs text-on-surface-variant font-medium">
          Acceso administrativo directo para la modificación y eliminación de registros del sistema Kimma
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Listado de tablas */}
        <div className="lg:col-span-1 ds-card p-4 space-y-2.5 max-h-[70vh] overflow-y-auto">
          <span className="text-[10px] font-extrabold text-on-surface-variant/70 uppercase tracking-widest block px-2 mb-2">Tablas del Sistema</span>
          {tables.map((table) => {
            const isSelected = selectedTable === table;
            return (
              <button
                key={table}
                onClick={() => onSelectTable(table)}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all truncate flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <MaterialIcon
                  name={
                    table === "auditoria_logs"
                      ? "history"
                      : table === "configuraciones_sistema"
                      ? "settings_applications"
                      : "table_chart"
                  }
                  className="text-sm shrink-0"
                />
                <span className="truncate">{table}</span>
              </button>
            );
          })}
        </div>

        {/* Registros de tabla seleccionada */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between bg-surface-container/30 border border-outline-variant/20 px-5 py-3 rounded-2xl">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Tabla Seleccionada</span>
              <span className="text-sm font-extrabold text-on-surface font-mono">{selectedTable}</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant/80">
              Total registros: {tableRecords.length}
            </span>
          </div>

          {loadingData ? (
            <div className="text-center py-12 ds-card">
              <MaterialIcon name="progress_activity" className="animate-spin text-3xl text-primary" />
              <span className="block mt-2 text-xs font-semibold text-on-surface-variant">Cargando base de datos...</span>
            </div>
          ) : tableRecords.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant ds-card">
              <span className="text-3xl block mb-2">📦</span>
              <p className="text-xs font-semibold">Esta tabla no contiene ningún registro en la base de datos.</p>
            </div>
          ) : (
            <div className="ds-card p-4 overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-on-surface-variant font-bold bg-surface-container-low/50 sticky top-0">
                    {Object.keys(tableRecords[0]).map((key) => (
                      <th key={key} className="py-2.5 px-3 font-mono">{key}</th>
                    ))}
                    <th className="py-2.5 px-3 text-right sticky right-0 bg-surface-container-lowest shadow-[-8px_0_12px_rgba(0,0,0,0.03)]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                  {tableRecords.map((record, index) => (
                    <tr key={index} className="hover:bg-surface-container-low transition-colors">
                      {Object.values(record).map((value: any, idx) => {
                        let displayValue = "";
                        if (value === null || value === undefined) {
                          displayValue = "null";
                        } else if (typeof value === "boolean") {
                          displayValue = value ? "true" : "false";
                        } else if (typeof value === "object") {
                          displayValue = JSON.stringify(value);
                        } else {
                          displayValue = value.toString();
                        }

                        return (
                          <td key={idx} className="py-2.5 px-3 max-w-[220px] truncate font-mono text-[11px] text-on-surface/90" title={displayValue}>
                            {displayValue}
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 whitespace-nowrap text-right space-x-1 sticky right-0 bg-surface-container-lowest shadow-[-8px_0_12px_rgba(0,0,0,0.03)]">
                        <button
                          type="button"
                          onClick={() => onEditRecord(record)}
                          className="p-1 hover:bg-surface-container rounded-lg text-primary transition-all cursor-pointer inline-flex items-center justify-center"
                          title="Editar Fila"
                        >
                          <MaterialIcon name="edit" className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(record)}
                          className="p-1 hover:bg-error/15 rounded-lg text-error transition-all cursor-pointer inline-flex items-center justify-center"
                          title="Eliminar Fila"
                        >
                          <MaterialIcon name="delete" className="text-base" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
