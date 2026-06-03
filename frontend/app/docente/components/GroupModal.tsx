import React from "react";

interface GroupModalProps {
  showGroupModal: boolean;
  setShowGroupModal: (val: boolean) => void;
  groupForm: { nombre: string };
  setGroupForm: React.Dispatch<React.SetStateAction<{ nombre: string }>>;
  handleCreateGroup: (e: React.FormEvent) => void;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  showGroupModal,
  setShowGroupModal,
  groupForm,
  setGroupForm,
  handleCreateGroup,
}) => {
  if (!showGroupModal) return null;

  return (
    <div className="ds-modal-overlay fixed inset-0 z-50 flex animate-fade-in items-center justify-center p-4 backdrop-blur-sm">
      <div className="ds-modal relative max-w-md w-full space-y-6 p-6 sm:p-8">
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <h3 className="text-lg font-bold text-on-surface">Registrar Nuevo Grupo / Aula</h3>
          <button
            onClick={() => {
              setShowGroupModal(false);
              setGroupForm({ nombre: "" });
            }}
            className="text-on-surface-variant/80 hover:text-on-surface cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant block">Nombre del Grupo</label>
            <input
              type="text"
              required
              placeholder="Ej: Inicial II - Semillero B"
              value={groupForm.nombre}
              onChange={(e) => setGroupForm({ nombre: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => {
                setShowGroupModal(false);
                setGroupForm({ nombre: "" });
              }}
              className="py-2.5 px-4 bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded-xl text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-4 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl cursor-pointer"
            >
              Registrar Grupo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
