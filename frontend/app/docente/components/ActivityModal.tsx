import React, { useState, useEffect } from "react";

interface ActivityModalProps {
  showActivityModal: boolean;
  setShowActivityModal: (val: boolean) => void;
  activityForm: any;
  setActivityForm: React.Dispatch<React.SetStateAction<any>>;
  handleCreateActivity: (e: React.FormEvent, finalRecursos?: { titulo: string; url: string }[]) => void;
  isReadOnly?: boolean;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  showActivityModal,
  setShowActivityModal,
  activityForm,
  setActivityForm,
  handleCreateActivity,
  isReadOnly = false,
}) => {
  const [recursoTitulo, setRecursoTitulo] = useState("");
  const [recursoUrl, setRecursoUrl] = useState("");

  // Limpiar campos cuando se cierra/abre el modal
  useEffect(() => {
    if (!showActivityModal) {
      setRecursoTitulo("");
      setRecursoUrl("");
    }
  }, [showActivityModal]);

  if (!showActivityModal) return null;

  return (
    <div className="ds-modal-overlay fixed inset-0 z-50 flex animate-fade-in items-center justify-center p-4 backdrop-blur-sm">
      <div className="ds-modal relative max-w-md w-full space-y-6 p-6 sm:p-8">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-on-surface">
            {isReadOnly ? "Ver Detalles de la Actividad" : (activityForm.id ? "Editar Actividad" : "Añadir Actividad")}
          </h3>
          <button
            onClick={() => setShowActivityModal(false)}
            className="text-on-surface-variant/80 hover:text-on-surface cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            if (isReadOnly) {
              e.preventDefault();
              return;
            }
            let finalRecursos = [...(activityForm.recursos || [])];
            if (recursoTitulo.trim() && recursoUrl.trim()) {
              finalRecursos.push({ titulo: recursoTitulo.trim(), url: recursoUrl.trim() });
            }
            handleCreateActivity(e, finalRecursos);
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant block">Título de la Actividad</label>
            <input
              type="text"
              required
              disabled={isReadOnly}
              placeholder="Ej: Pintar lámina con crayones"
              value={activityForm.titulo}
              onChange={(e) => setActivityForm({ ...activityForm, titulo: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-75 disabled:bg-surface-container"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant block">Instrucciones</label>
            <textarea
              required
              disabled={isReadOnly}
              placeholder="Procedimiento detallado..."
              value={activityForm.descripcion}
              onChange={(e) => setActivityForm({ ...activityForm, descripcion: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary h-[80px] disabled:opacity-75 disabled:bg-surface-container"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant block">Tipo de Actividad</label>
            <select
              disabled={isReadOnly}
              value={activityForm.tipo}
              onChange={(e) => setActivityForm({ ...activityForm, tipo: e.target.value as any })}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-75 disabled:bg-surface-container"
            >
              <option value="clase">En Clase</option>
              <option value="casa">En Casa (Extensión)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant block">Fecha y Hora Límite de Entrega</label>
            <input
              type="datetime-local"
              required
              disabled={isReadOnly}
              value={activityForm.fecha_limite || ""}
              onChange={(e) => setActivityForm({ ...activityForm, fecha_limite: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer disabled:opacity-75 disabled:bg-surface-container"
            />
          </div>

          {activityForm.tipo === "casa" && (
            <div className="space-y-3 border-t border-outline-variant/10 pt-3">
              <label className="text-xs font-bold text-on-surface-variant block">Recursos Adicionales (Opcional)</label>

              {/* Formulario en línea para añadir recursos (sólo editable) */}
              {!isReadOnly && (
                <div className="space-y-2 border border-outline-variant/20 rounded-xl p-3 bg-surface-container-low">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Nuevo Archivo o Enlace</span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Nombre del recurso (ej: Vídeo de seriación)"
                      value={recursoTitulo}
                      onChange={(e) => setRecursoTitulo(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Enlace web (ej: https://...)"
                      value={recursoUrl}
                      onChange={(e) => setRecursoUrl(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (recursoTitulo.trim() && recursoUrl.trim()) {
                        setActivityForm((prev: any) => ({
                          ...prev,
                          recursos: [...prev.recursos, { titulo: recursoTitulo.trim(), url: recursoUrl.trim() }]
                        }));
                        setRecursoTitulo("");
                        setRecursoUrl("");
                      }
                    }}
                    className="w-full py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl text-xs font-bold cursor-pointer text-primary transition-all"
                  >
                    + Vincular Recurso
                  </button>
                </div>
              )}

              {/* Lista de recursos agregados */}
              {activityForm.recursos && activityForm.recursos.length > 0 && (
                <div className="max-h-28 overflow-y-auto space-y-1.5">
                  {activityForm.recursos.map((rec: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-surface-container-low border border-outline-variant/30 p-2 rounded-lg text-xs">
                      <span className="truncate max-w-[200px] text-on-surface">
                        📄{" "}
                        {rec.url ? (
                          <a
                            href={rec.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-bold"
                          >
                            {rec.titulo}
                          </a>
                        ) : (
                          <strong>{rec.titulo}</strong>
                        )}
                      </span>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            setActivityForm((prev: any) => ({
                              ...prev,
                              recursos: prev.recursos.filter((_: any, idx: number) => idx !== i)
                            }));
                          }}
                          className="text-red-400 hover:text-red-300 font-bold cursor-pointer"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/20">
            {isReadOnly ? (
              <button
                type="button"
                onClick={() => setShowActivityModal(false)}
                className="py-2 px-6 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                Cerrar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="py-2.5 px-4 bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl cursor-pointer"
                >
                  {activityForm.id ? "Guardar Cambios" : "Agregar Actividad"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
