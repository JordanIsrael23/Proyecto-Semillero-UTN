import { Estudiante, UnidadDidactica, Criterio, NivelLogro, Grupo } from "../types";

interface EvaluarTabProps {
  selectedUnit: string;
  setSelectedUnit: (val: string) => void;
  unidades: UnidadDidactica[];
  estudiantes: Estudiante[];
  selectedStudent: Estudiante | null;
  setSelectedStudent: (val: Estudiante | null) => void;
  handleSaveEvaluaciones: () => void;
  criterios: Criterio[];
  evaluacionesActive: { [criterioId: string]: { nivelId: string; obs: string } };
  niveles: NivelLogro[];
  handleGradeCriterio: (criterioId: string, nivelId: string) => void;
  handleGradeObsChange: (criterioId: string, obs: string) => void;
  selectedGroup: string;
  setSelectedGroup: (val: string) => void;
  grupos: Grupo[];
}

export const EvaluarTab: React.FC<EvaluarTabProps> = ({
  selectedUnit,
  setSelectedUnit,
  unidades,
  estudiantes,
  selectedStudent,
  setSelectedStudent,
  handleSaveEvaluaciones,
  criterios,
  evaluacionesActive,
  niveles,
  handleGradeCriterio,
  handleGradeObsChange,
  selectedGroup,
  setSelectedGroup,
  grupos,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">Registro de Evaluaciones</h2>
          <p className="text-xs text-on-surface-variant mt-1">Evalúa de forma ágil mediante la rúbrica cognitiva.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setSelectedStudent(null);
              setSelectedUnit("");
            }}
            className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-full sm:w-[200px] cursor-pointer"
          >
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-full sm:w-[220px] cursor-pointer"
          >
            <option value="">-- Selecciona Unidad --</option>
            {unidades.filter(u => u.estado === 'activo').map((u) => (
              <option key={u.id} value={u.id}>
                {u.titulo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selector horizontal de Estudiante */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin">
        {estudiantes.map((est) => (
          <button
            key={est.id}
            onClick={() => setSelectedStudent(est)}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${selectedStudent?.id === est.id
              ? "bg-primary border-primary text-on-surface shadow-lg shadow-primary/20"
              : "bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface"
              }`}
          >
            {est.apellido}, {est.nombre}
          </button>
        ))}
      </div>

      {selectedStudent && selectedUnit ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl gap-4">
            <div>
              <p className="text-xs text-on-surface-variant/80 font-bold uppercase tracking-wider">Estudiante Evaluado</p>
              <h3 className="text-lg font-bold text-on-surface mt-1">{selectedStudent.nombre} {selectedStudent.apellido}</h3>
            </div>
            <button
              onClick={handleSaveEvaluaciones}
              className="py-3 px-5 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer w-full sm:w-auto"
            >
              Guardar Todas las Evaluaciones
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {criterios.map((crit) => {
              const selection = evaluacionesActive[crit.id] || { nivelId: "", obs: "" };
              return (
                <div key={crit.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between hover:border-outline-variant/30 transition-all shadow-xl">
                  <div>
                    <h4 className="text-base font-bold text-on-surface">{crit.nombre}</h4>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{crit.descripcion}</p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {niveles.map((niv) => {
                        const isActive = selection.nivelId === niv.id;
                        let activeClass = "bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface";
                        if (isActive) {
                          if (niv.codigo === "I") activeClass = "bg-red-500/20 border-red-500 text-red-300 shadow-md shadow-red-500/5";
                          if (niv.codigo === "EP") activeClass = "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/5";
                          if (niv.codigo === "L") activeClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/5";
                        }
                        return (
                          <button
                            key={niv.id}
                            onClick={() => handleGradeCriterio(crit.id, niv.id)}
                            className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${activeClass}`}
                          >
                            {niv.nombre}
                          </button>
                        );
                      })}
                    </div>
                    <textarea
                      placeholder="Observaciones de logro..."
                      value={selection.obs}
                      onChange={(e) => handleGradeObsChange(crit.id, e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2 text-xs text-on-surface focus:outline-none focus:border-primary h-[60px] resize-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl text-center py-20 text-on-surface-variant/80">
          <span className="text-4xl block mb-3">📝</span>
          <p className="text-sm font-bold">Por favor, selecciona una Unidad Activa y un Estudiante para iniciar la evaluación.</p>
        </div>
      )}
    </div>
  );
};
