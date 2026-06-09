import React from "react";
import { UnidadDidactica, Grupo } from "../types";

interface PlanificacionTabProps {
  unidades: UnidadDidactica[];
  setUnitForm: React.Dispatch<React.SetStateAction<any>>;
  setShowUnitModal: (val: boolean) => void;
  handleCloneUnit: (id: string) => void;
  setSelectedUnit: (id: string) => void;
  setActivityForm: React.Dispatch<React.SetStateAction<any>>;
  setShowActivityModal: (val: boolean) => void;
  selectedGroup: string;
  setSelectedGroup: (val: string) => void;
  grupos: Grupo[];
  handleDeleteActivity: (id: string) => void;
  setIsActivityReadOnly: (val: boolean) => void;
  handleDeleteUnit: (id: string) => void;
}

export const PlanificacionTab: React.FC<PlanificacionTabProps> = ({
  unidades,
  setUnitForm,
  setShowUnitModal,
  handleCloneUnit,
  setSelectedUnit,
  setActivityForm,
  setShowActivityModal,
  selectedGroup,
  setSelectedGroup,
  grupos,
  handleDeleteActivity,
  setIsActivityReadOnly,
  handleDeleteUnit,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">Planificación de Actividades</h2>
          <p className="text-xs text-on-surface-variant mt-1">Gestiona unidades didácticas y asigna tareas.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-full sm:w-[220px] cursor-pointer"
          >
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setUnitForm({ id: "", titulo: "", resumen: "", ambito: "Relaciones lógico-matemáticas", objetivos_generales: "", objetivos_aprendizaje: "", destrezas: "", semanas_previstas: 1, estado: "borrador", grupo_id: selectedGroup });
              setShowUnitModal(true);
            }}
            className="py-2.5 px-4 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer shrink-0"
          >
            + Nueva Unidad Didáctica
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {unidades.map((unit) => (
          <div key={unit.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between hover:border-outline-variant/30 transition-all shadow-xl">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-extrabold uppercase bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 tracking-wider">
                  {unit.ambito}
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wider ${unit.estado === "activo"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : unit.estado === "borrador"
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                    : "bg-surface-container text-on-surface-variant border-outline-variant/30"
                  }`}>
                  {unit.estado}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">{unit.titulo}</h3>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{unit.resumen || "Sin descripción disponible."}</p>
              </div>
              <div className="text-xs text-on-surface-variant/80 font-semibold flex items-center gap-1.5">
                <span>🕒</span>
                <span>Semanas previstas: {unit.semanas_previstas}</span>
              </div>

              {unit.actividades && unit.actividades.length > 0 && (
                <div className="border-t border-outline-variant/20 pt-4 mt-4">
                  <p className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider mb-2">Actividades vinculadas:</p>
                  <ul className="space-y-2 text-xs text-on-surface-variant">
                    {unit.actividades.map((act) => (
                      <li key={act.id} className="flex items-center justify-between bg-surface-container-lowest/50 hover:bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/10 group transition-all">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${act.tipo === "casa" ? "bg-highlight-orange/10 text-highlight-orange" : "bg-primary/10 text-primary"
                            }`}>
                            {act.tipo}
                          </span>
                          <span className="font-semibold">{act.titulo}</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            title="Ver detalles"
                            onClick={() => {
                              setSelectedUnit(unit.id);
                              setActivityForm({
                                id: act.id,
                                titulo: act.titulo,
                                descripcion: act.descripcion || "",
                                tipo: act.tipo,
                                recursos: act.recursos_enlaces || [],
                                fecha_limite: act.fecha_limite ? new Date(act.fecha_limite).toISOString().substring(0, 16) : ""
                              });
                              setIsActivityReadOnly(true);
                              setShowActivityModal(true);
                            }}
                            className="p-1 hover:bg-primary/10 text-primary hover:text-primary rounded cursor-pointer transition-colors"
                          >
                            👁️
                          </button>
                          <button
                            type="button"
                            title="Editar actividad"
                            onClick={() => {
                              setSelectedUnit(unit.id);
                              setActivityForm({
                                id: act.id,
                                titulo: act.titulo,
                                descripcion: act.descripcion || "",
                                tipo: act.tipo,
                                recursos: act.recursos_enlaces || [],
                                fecha_limite: act.fecha_limite ? new Date(act.fecha_limite).toISOString().substring(0, 16) : ""
                              });
                              setIsActivityReadOnly(false);
                              setShowActivityModal(true);
                            }}
                            className="p-1 hover:bg-primary/10 text-primary hover:text-primary rounded cursor-pointer transition-colors"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            title="Borrar actividad"
                            onClick={() => handleDeleteActivity(act.id)}
                            className="p-1 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded cursor-pointer transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-outline-variant/20 pt-4 mt-6">
              <button
                onClick={() => {
                  setUnitForm({
                    id: unit.id,
                    titulo: unit.titulo,
                    resumen: unit.resumen || "",
                    ambito: unit.ambito,
                    objetivos_generales: unit.objetivos_generales || "",
                    objetivos_aprendizaje: unit.objetivos_aprendizaje || "",
                    destrezas: unit.destrezas || "",
                    semanas_previstas: unit.semanas_previstas,
                    estado: unit.estado,
                    grupo_id: unit.grupo_id
                  });
                  setShowUnitModal(true);
                }}
                className="flex-1 py-2 bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Editar
              </button>
              <button
                onClick={() => handleCloneUnit(unit.id)}
                className="flex-1 py-2 bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Clonar
              </button>
              <button
                onClick={() => handleDeleteUnit(unit.id)}
                className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Eliminar Unidad"
              >
                🗑️
              </button>
              <button
                onClick={() => {
                  setSelectedUnit(unit.id);
                  setActivityForm({ titulo: "", descripcion: "", tipo: "casa", recursos: [], fecha_limite: "" });
                  setIsActivityReadOnly(false);
                  setShowActivityModal(true);
                }}
                className="py-2 px-3 bg-primary hover:brightness-110 text-on-primary rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                + Actividad
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
