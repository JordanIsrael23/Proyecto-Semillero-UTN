import React from "react";

interface UnitModalProps {
  showUnitModal: boolean;
  setShowUnitModal: (val: boolean) => void;
  unitForm: any;
  setUnitForm: React.Dispatch<React.SetStateAction<any>>;
  handleSaveUnit: (e: React.FormEvent) => void;
  grupos: any[];
}

export const UnitModal: React.FC<UnitModalProps> = ({
  showUnitModal,
  setShowUnitModal,
  unitForm,
  setUnitForm,
  handleSaveUnit,
  grupos,
}) => {
  if (!showUnitModal) return null;

  return (
    <div className="ds-modal-overlay fixed inset-0 z-50 flex animate-fade-in items-center justify-center p-4 backdrop-blur-sm">
      <div className="ds-modal relative max-w-3xl w-full space-y-6 p-6 sm:p-8">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-on-surface">
            {unitForm.id ? "Editar Unidad Didáctica" : "Crear Unidad Didáctica"}
          </h3>
          <button
            onClick={() => setShowUnitModal(false)}
            className="text-on-surface-variant/80 hover:text-on-surface cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSaveUnit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-on-surface-variant block">Grupo / Aula Destinataria</label>
              <select
                required
                value={unitForm.grupo_id || ""}
                onChange={(e) => setUnitForm({ ...unitForm, grupo_id: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary h-[38px] cursor-pointer"
              >
                <option value="" disabled>Seleccione un grupo...</option>
                {grupos.map((g: any) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant block">Título de la Unidad</label>
              <input
                type="text"
                required
                placeholder="Ej: Unidad 1: Colores primarios"
                value={unitForm.titulo}
                onChange={(e) => setUnitForm({ ...unitForm, titulo: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant block">Ámbito Cognitivo</label>
              <input
                type="text"
                required
                placeholder="Ej: Relaciones lógico-matemáticas"
                value={unitForm.ambito}
                onChange={(e) => setUnitForm({ ...unitForm, ambito: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-on-surface-variant block">Resumen Pedagógico</label>
              <textarea
                placeholder="Resumen del ámbito a evaluar..."
                value={unitForm.resumen}
                onChange={(e) => setUnitForm({ ...unitForm, resumen: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary h-[60px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant block">Objetivos Generales</label>
              <textarea
                value={unitForm.objetivos_generales}
                onChange={(e) => setUnitForm({ ...unitForm, objetivos_generales: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary h-[60px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant block">Objetivos de Aprendizaje</label>
              <textarea
                value={unitForm.objetivos_aprendizaje}
                onChange={(e) => setUnitForm({ ...unitForm, objetivos_aprendizaje: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary h-[60px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant block">Destrezas a Evaluar</label>
              <textarea
                value={unitForm.destrezas}
                onChange={(e) => setUnitForm({ ...unitForm, destrezas: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary h-[116px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 content-start">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Semanas Previstas</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={unitForm.semanas_previstas}
                  onChange={(e) => setUnitForm({ ...unitForm, semanas_previstas: Number(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Estado</label>
                <select
                  value={unitForm.estado}
                  onChange={(e) => setUnitForm({ ...unitForm, estado: e.target.value as any })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary h-[38px]"
                >
                  <option value="borrador">Borrador</option>
                  <option value="activo">Activo</option>
                  <option value="archivado">Archivado</option>
                </select>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setShowUnitModal(false)}
              className="py-2.5 px-4 bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded-xl text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-4 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl cursor-pointer"
            >
              Guardar Planificación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
