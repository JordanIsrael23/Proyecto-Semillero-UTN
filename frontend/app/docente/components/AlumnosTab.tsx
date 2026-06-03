import React from "react";
import { Estudiante, Grupo } from "../types";

interface AlumnosTabProps {
  estudiantes: Estudiante[];
  selectedGroup: string;
  setSelectedGroup: (val: string) => void;
  grupos: Grupo[];
  setShowGroupModal: (val: boolean) => void;
  setShowStudentModal: (val: boolean) => void;
  handleOpenGradeTasksModal: (est: Estudiante) => void;
  handleDownloadInforme: (estId: string) => void;
  setConfirmModal: (val: { message: string; onConfirm: () => void } | null) => void;
  setFeedback: (val: { message: string; type: "success" | "error" } | null) => void;
  BACKEND_URL: string;
  setEstudiantes: React.Dispatch<React.SetStateAction<Estudiante[]>>;
}

export const AlumnosTab: React.FC<AlumnosTabProps> = ({
  estudiantes,
  selectedGroup,
  setSelectedGroup,
  grupos,
  setShowGroupModal,
  setShowStudentModal,
  handleOpenGradeTasksModal,
  handleDownloadInforme,
  setConfirmModal,
  setFeedback,
  BACKEND_URL,
  setEstudiantes,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">Alumnos y Grupos</h2>
          <p className="text-xs text-on-surface-variant mt-1">Registra estudiantes y vincula sus representantes.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
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
          <button
            onClick={() => setShowGroupModal(true)}
            className="py-2.5 px-4 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer shrink-0"
          >
            + Agregar Grupo
          </button>
          <button
            onClick={() => setShowStudentModal(true)}
            className="py-2.5 px-4 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer shrink-0"
          >
            + Agregar Alumno
          </button>
        </div>
      </div>

      {/* Listado de Estudiantes */}
      <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
        {estudiantes.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant/80 space-y-2">
            <span className="text-4xl block">👥</span>
            <p className="font-bold text-sm">No hay alumnos registrados en este grupo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Cédula</th>
                  <th className="px-6 py-4">Nombre y Apellido</th>
                  <th className="px-6 py-4">F. Nacimiento</th>
                  <th className="px-6 py-4">Representante</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {estudiantes.map((est) => {
                  const rep = est.familia_estudiante?.[0];
                  return (
                    <tr key={est.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-on-surface-variant font-bold">{est.cedula}</td>
                      <td className="px-6 py-4 font-bold text-on-surface">{est.apellido}, {est.nombre}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{new Date(est.fecha_nacimiento).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {rep ? (
                          <div>
                            <p className="text-on-surface font-semibold">{rep.familias.nombre} {rep.familias.apellido}</p>
                            <p className="text-[10px] text-on-surface-variant/80 font-bold uppercase tracking-wider">{rep.parentesco}</p>
                          </div>
                        ) : (
                          <span className="text-on-surface-variant/80 font-medium">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenGradeTasksModal(est)}
                          className="py-1.5 px-3 bg-surface-container-lowest hover:bg-tertiary/10 hover:text-tertiary border border-outline-variant/30 rounded-lg text-xs font-bold transition-all cursor-pointer text-on-surface-variant"
                        >
                          Calificar Tareas
                        </button>
                        <button
                          onClick={() => handleDownloadInforme(est.id)}
                          className="py-1.5 px-3 bg-surface-container-lowest hover:bg-primary/10 hover:text-primary border border-outline-variant/30 rounded-lg text-xs font-bold transition-all cursor-pointer text-on-surface-variant"
                        >
                          Informe TXT
                        </button>
                        <button
                          onClick={() => {
                            setConfirmModal({
                              message: `¿Seguro que deseas dar de baja lógica a ${est.nombre} ${est.apellido}? Esta acción desactivará al estudiante.`,
                              onConfirm: async () => {
                                await fetch(`${BACKEND_URL}/estudiantes/${est.id}`, { method: "DELETE" });
                                const res = await fetch(`${BACKEND_URL}/grupos/${selectedGroup}/estudiantes`);
                                setEstudiantes(await res.json());
                                setFeedback({ message: `${est.nombre} ${est.apellido} fue dado de baja exitosamente.`, type: "success" });
                              },
                            });
                          }}
                          className="py-1.5 px-3 bg-surface-container-lowest hover:bg-red-500/10 hover:text-red-400 border border-outline-variant/30 rounded-lg text-xs font-bold transition-all cursor-pointer text-on-surface-variant/80"
                        >
                          Dar de Baja
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
