import React from "react";

interface StudentModalProps {
  showStudentModal: boolean;
  setShowStudentModal: (val: boolean) => void;
  isStudentAutofilled: boolean;
  setIsStudentAutofilled: (val: boolean) => void;
  isRepresentativeAutofilled: boolean;
  setIsRepresentativeAutofilled: (val: boolean) => void;
  studentForm: any;
  setStudentForm: React.Dispatch<React.SetStateAction<any>>;
  representativeForm: any;
  setRepresentativeForm: React.Dispatch<React.SetStateAction<any>>;
  setLastSearchedStudentCedula: (val: string) => void;
  setLastSearchedRepCedula: (val: string) => void;
  handleCreateStudent: (e: React.FormEvent) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  showStudentModal,
  setShowStudentModal,
  isStudentAutofilled,
  setIsStudentAutofilled,
  isRepresentativeAutofilled,
  setIsRepresentativeAutofilled,
  studentForm,
  setStudentForm,
  representativeForm,
  setRepresentativeForm,
  setLastSearchedStudentCedula,
  setLastSearchedRepCedula,
  handleCreateStudent,
}) => {
  if (!showStudentModal) return null;

  return (
    <div className="ds-modal-overlay fixed inset-0 z-50 flex animate-fade-in items-center justify-center p-4 backdrop-blur-sm">
      <div className="ds-modal relative max-w-4xl w-full space-y-6 p-6 sm:p-8">
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <h3 className="text-lg font-bold text-on-surface">Registrar Estudiante y Representante</h3>
          <button
            onClick={() => {
              setShowStudentModal(false);
              setIsStudentAutofilled(false);
              setIsRepresentativeAutofilled(false);
              setStudentForm({
                cedula: "",
                nombre: "",
                apellido: "",
                fecha_nacimiento: "",
                representante_id: "",
                parentesco: "Padre"
              });
              setRepresentativeForm({
                cedula: "",
                nombre: "",
                apellido: "",
                email: "",
                telefono: "",
                direccion: ""
              });
              setLastSearchedStudentCedula("");
              setLastSearchedRepCedula("");
            }}
            className="text-on-surface-variant/80 hover:text-on-surface cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateStudent} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* COLUMNA IZQUIERDA: DATOS DEL ESTUDIANTE */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-primary border-b border-outline-variant/10 pb-2">
                Datos del Estudiante
              </h4>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Cédula del Niño (10 dígitos)</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="Ej: 1005678901"
                  value={studentForm.cedula}
                  onChange={(e) => setStudentForm({ ...studentForm, cedula: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
                {isStudentAutofilled && (
                  <span className="text-[11px] text-green-400 font-bold block mt-1">
                    ✓ Estudiante encontrado (autocompletado, se actualizará su grupo).
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Nombre</label>
                <input
                  type="text"
                  required
                  disabled={isStudentAutofilled}
                  value={studentForm.nombre}
                  onChange={(e) => setStudentForm({ ...studentForm, nombre: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-75 disabled:bg-surface-container"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Apellido</label>
                <input
                  type="text"
                  required
                  disabled={isStudentAutofilled}
                  value={studentForm.apellido}
                  onChange={(e) => setStudentForm({ ...studentForm, apellido: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-75 disabled:bg-surface-container"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Fecha de Nacimiento</label>
                <input
                  type="date"
                  required
                  disabled={isStudentAutofilled}
                  max={(() => {
                    const hoy = new Date();
                    const limiteSeisAnios = new Date(hoy.getFullYear() - 6, hoy.getMonth(), hoy.getDate());
                    return limiteSeisAnios.toISOString().split("T")[0];
                  })()}
                  value={studentForm.fecha_nacimiento}
                  onChange={(e) => setStudentForm({ ...studentForm, fecha_nacimiento: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-75 disabled:bg-surface-container"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Relación Representante-&gt;Estudiante</label>
                <select
                  value={studentForm.parentesco}
                  onChange={(e) => setStudentForm({ ...studentForm, parentesco: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Padre">Padre</option>
                  <option value="Madre">Madre</option>
                  <option value="Tutor">Tutor / Representante Legal</option>
                </select>
              </div>
            </div>

            {/* COLUMNA DERECHA: DATOS DEL REPRESENTANTE */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-primary border-b border-outline-variant/10 pb-2">
                Datos del Representante (Familia)
              </h4>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Cédula del Representante (10 dígitos)</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="Ej: 1003456789"
                  value={representativeForm.cedula}
                  onChange={(e) => setRepresentativeForm({ ...representativeForm, cedula: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
                {isRepresentativeAutofilled && (
                  <span className="text-[11px] text-green-400 font-bold block mt-1">
                    ✓ Representante encontrado (autocompletado, se vinculará automáticamente).
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Nombre</label>
                <input
                  type="text"
                  required
                  disabled={isRepresentativeAutofilled}
                  value={representativeForm.nombre}
                  onChange={(e) => setRepresentativeForm({ ...representativeForm, nombre: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-75 disabled:bg-surface-container"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Apellido</label>
                <input
                  type="text"
                  required
                  disabled={isRepresentativeAutofilled}
                  value={representativeForm.apellido}
                  onChange={(e) => setRepresentativeForm({ ...representativeForm, apellido: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-75 disabled:bg-surface-container"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  disabled={isRepresentativeAutofilled}
                  value={representativeForm.email}
                  onChange={(e) => setRepresentativeForm({ ...representativeForm, email: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-75 disabled:bg-surface-container"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Teléfono (Opcional)</label>
                <input
                  type="tel"
                  disabled={isRepresentativeAutofilled}
                  value={representativeForm.telefono}
                  onChange={(e) => setRepresentativeForm({ ...representativeForm, telefono: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-75 disabled:bg-surface-container"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Dirección de Domicilio</label>
                <input
                  type="text"
                  disabled={isRepresentativeAutofilled}
                  placeholder="Ej: Sector El Olivo"
                  value={representativeForm.direccion || ""}
                  onChange={(e) => setRepresentativeForm({ ...representativeForm, direccion: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-75 disabled:bg-surface-container"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => {
                setShowStudentModal(false);
                setIsStudentAutofilled(false);
                setIsRepresentativeAutofilled(false);
                setStudentForm({
                  cedula: "",
                  nombre: "",
                  apellido: "",
                  fecha_nacimiento: "",
                  representante_id: "",
                  parentesco: "Padre"
                });
                setRepresentativeForm({
                  cedula: "",
                  nombre: "",
                  apellido: "",
                  email: "",
                  telefono: "",
                  direccion: ""
                });
                setLastSearchedStudentCedula("");
                setLastSearchedRepCedula("");
              }}
              className="py-2.5 px-4 bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded-xl text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-4 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl cursor-pointer"
            >
              Registrar Todo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
