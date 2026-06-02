"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validarCedulaEcuatoriana } from "../utils/validation";
import DashboardWelcome from "../components/DashboardWelcome";
import DashboardShell from "../components/DashboardShell";
import AppModal from "../components/AppModal";

const DOCENTE_NAV = [
  { id: "inicio", label: "Inicio", icon: "home" },
  { id: "alumnos", label: "Alumnos y Grupos", icon: "group" },
  { id: "planificacion", label: "Planificación Didáctica", icon: "menu_book" },
  { id: "evaluar", label: "Rejilla de Evaluación", icon: "grid_on" },
  { id: "monitoreo", label: "Ficha de Monitoreo", icon: "assignment_turned_in" },
  { id: "autoevaluacion", label: "Autoevaluación Docente", icon: "person_check" },
  { id: "consolidado", label: "Métricas Colectivas", icon: "analytics" },
] as const;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

interface UsuarioSession {
  user: {
    id: string;
    cedula: string;
    email: string;
    rol: "docente" | "familia";
  };
  perfil: {
    id: string;
    nombre: string;
    apellido: string;
    telefono?: string;
  };
}

interface Grupo {
  id: string;
  nombre: string;
  docente_id: string;
  _count?: { estudiantes: number };
}

interface Estudiante {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  grupo_id: string;
  fecha_nacimiento: string;
  activo: boolean;
  familia_estudiante?: { parentesco: string; familias: { nombre: string; apellido: string } }[];
}

interface UnidadDidactica {
  id: string;
  titulo: string;
  resumen?: string;
  ambito: string;
  objetivos_generales?: string;
  objetivos_aprendizaje?: string;
  destrezas?: string;
  semanas_previstas: number;
  estado: "borrador" | "activo" | "archivado";
  actividades?: Actividad[];
}

interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: "clase" | "casa";
  recursos_enlaces?: any;
}

interface Criterio {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

interface NivelLogro {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
}

interface FichaMonitoreo {
  id?: string;
  clasificacion: string;
  seriacion: string;
  asimilacion_acomodacion: string;
  justificacion_logica: string;
  autorregulacion: string;
  observaciones?: string;
  acciones_apoyo?: string;
}

interface MetricaGrupal {
  criterion: string;
  iniciado: number;
  enProceso: number;
  logrado: number;
}

interface FamiliaDemo {
  id: string;
  nombre: string;
  apellido: string;
  usuarios?: { email: string };
}

export default function DocenteDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UsuarioSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Estados comunes de datos
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [niveles, setNiveles] = useState<NivelLogro[]>([]);
  const [familias, setFamilias] = useState<FamiliaDemo[]>([]);

  // Estados de negocio
  const [activeTab, setActiveTab] = useState<string>("inicio");
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [unidades, setUnidades] = useState<UnidadDidactica[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(null);

  // Formularios y modales
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [groupForm, setGroupForm] = useState({
    nombre: ""
  });

  const [studentForm, setStudentForm] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    representante_id: "",
    parentesco: "Padre"
  });

  const [representativeForm, setRepresentativeForm] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: ""
  });

  const [isStudentAutofilled, setIsStudentAutofilled] = useState(false);
  const [isRepresentativeAutofilled, setIsRepresentativeAutofilled] = useState(false);
  const [lastSearchedStudentCedula, setLastSearchedStudentCedula] = useState("");
  const [lastSearchedRepCedula, setLastSearchedRepCedula] = useState("");

  const [showGradeTasksModal, setShowGradeTasksModal] = useState(false);
  const [selectedStudentForTasks, setSelectedStudentForTasks] = useState<Estudiante | null>(null);
  const [studentTasks, setStudentTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [savingTaskGradeId, setSavingTaskGradeId] = useState<string | null>(null);

  // Modal de confirmación (reemplaza window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [unitForm, setUnitForm] = useState({
    id: "",
    titulo: "",
    resumen: "",
    ambito: "",
    objetivos_generales: "",
    objetivos_aprendizaje: "",
    destrezas: "",
    semanas_previstas: 1,
    estado: "borrador"
  });

  const [activityForm, setActivityForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "casa" as "clase" | "casa",
    recursos: [] as { titulo: string; url: string }[]
  });

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  // Rejilla de evaluaciones activa
  const [evaluacionesActive, setEvaluacionesActive] = useState<{ [criterioId: string]: { nivelId: string; obs: string } }>({});

  // Ficha de monitoreo activa
  const [fichaMonitoreo, setFichaMonitoreo] = useState<FichaMonitoreo>({
    clasificacion: "",
    seriacion: "",
    asimilacion_acomodacion: "",
    justificacion_logica: "",
    autorregulacion: "",
    observaciones: "",
    acciones_apoyo: ""
  });

  // Autoevaluación
  const [autoevaluacionAnswers, setAutoevaluacionAnswers] = useState<{ [qNum: number]: "SI" | "NO" | "EP" }>({
    1: "SI", 2: "SI", 3: "SI", 4: "SI", 5: "SI", 6: "SI"
  });
  const [autoevaluacionReflexion, setAutoevaluacionReflexion] = useState("");

  // Métricas colectivas
  const [metricasGrupales, setMetricasGrupales] = useState<MetricaGrupal[]>([]);

  // 1. Validar sesión
  useEffect(() => {
    const sessionJson = localStorage.getItem("user_session");
    if (!sessionJson) {
      router.replace("/");
      return;
    }

    try {
      const parsedSession = JSON.parse(sessionJson);
      if (parsedSession.user?.rol !== "docente") {
        router.replace("/");
        return;
      }
      setSession(parsedSession);
    } catch (e) {
      router.replace("/");
      return;
    } finally {
      setLoadingSession(false);
    }
  }, [router]);

  // 2. Cargar rúbrica y catálogos cuando el usuario está logueado
  useEffect(() => {
    if (!session) return;

    // Criterios
    fetch(`${BACKEND_URL}/rubrica/criterios`)
      .then((res) => res.json())
      .then((data) => setCriterios(data))
      .catch((e) => console.error("Error al cargar criterios:", e));

    // Niveles
    fetch(`${BACKEND_URL}/rubrica/niveles`)
      .then((res) => res.json())
      .then((data) => setNiveles(data))
      .catch((e) => console.error("Error al cargar niveles:", e));

    // Familias cargadas para vinculación de representantes
    fetch(`${BACKEND_URL}/usuarios-demo`)
      .then((res) => res.json())
      .then((data) => {
        const list = data
          .filter((u: any) => u.rol === "familia")
          .map((u: any) => ({
            id: u.familias?.id,
            nombre: u.familias?.nombre,
            apellido: u.familias?.apellido,
            usuarios: { email: u.email }
          }));
        setFamilias(list);
      })
      .catch((e) => console.error("Error al cargar representantes:", e));

    // Grupos del docente
    fetch(`${BACKEND_URL}/docente/grupos`, { headers: { "x-user-id": session.user.id } })
      .then((res) => res.json())
      .then((data) => {
        setGrupos(data);
        if (data.length > 0) {
          setSelectedGroup(data[0].id);
        }
      })
      .catch((e) => console.error("Error al cargar grupos:", e));

    // Unidades del docente
    fetch(`${BACKEND_URL}/docente/unidades`, { headers: { "x-user-id": session.user.id } })
      .then((res) => res.json())
      .then((data) => {
        setUnidades(data);
        if (data.length > 0) {
          setSelectedUnit(data[0].id);
        }
      })
      .catch((e) => console.error("Error al cargar unidades:", e));
  }, [session]);

  // 3. Cargar estudiantes cuando cambia el grupo seleccionado
  useEffect(() => {
    if (!selectedGroup) return;
    fetch(`${BACKEND_URL}/grupos/${selectedGroup}/estudiantes`)
      .then((res) => res.json())
      .then((data) => {
        setEstudiantes(data);
        if (data.length > 0) {
          setSelectedStudent(data[0]);
        } else {
          setSelectedStudent(null);
        }
      })
      .catch((e) => console.error("Error al cargar estudiantes:", e));

    // Cargar métricas colectivas
    fetch(`${BACKEND_URL}/grupos/${selectedGroup}/consolidado`)
      .then((res) => res.json())
      .then((data) => setMetricasGrupales(data))
      .catch((e) => console.error("Error al cargar consolidados:", e));
  }, [selectedGroup]);

  // 4. Cargar ficha de monitoreo del alumno seleccionado
  useEffect(() => {
    if (!selectedStudent || activeTab !== "monitoreo") return;
    fetch(`${BACKEND_URL}/estudiantes/${selectedStudent.id}/ficha-monitoreo`)
      .then((res) => res.text().then((text) => (text ? JSON.parse(text) : null)))
      .then((data) => {
        if (data) {
          setFichaMonitoreo(data);
        } else {
          setFichaMonitoreo({
            clasificacion: "",
            seriacion: "",
            asimilacion_acomodacion: "",
            justificacion_logica: "",
            autorregulacion: "",
            observaciones: "",
            acciones_apoyo: ""
          });
        }
      })
      .catch((e) => console.error("Error al cargar ficha de monitoreo:", e));
  }, [selectedStudent, activeTab]);

  // Buscar estudiante por cédula
  useEffect(() => {
    const searchStudent = async () => {
      const ced = studentForm.cedula;
      if (ced.length === 10 && validarCedulaEcuatoriana(ced)) {
        if (ced === lastSearchedStudentCedula) return;
        setLastSearchedStudentCedula(ced);
        try {
          const res = await fetch(`${BACKEND_URL}/estudiantes/buscar/${ced}`);
          if (res.ok) {
            const text = await res.text();
            const data = text ? JSON.parse(text) : null;
            if (data) {
              setStudentForm(prev => ({
                ...prev,
                nombre: data.nombre,
                apellido: data.apellido,
                fecha_nacimiento: data.fecha_nacimiento
              }));
              setIsStudentAutofilled(true);

              // Si tiene representante vinculado, autocompletar también el representante
              const repRelation = data.familia_estudiante?.[0];
              if (repRelation) {
                const rep = repRelation.familias;
                const repCed = rep.usuarios?.cedula || "";
                setLastSearchedRepCedula(repCed);
                setRepresentativeForm({
                  cedula: repCed,
                  nombre: rep.nombre,
                  apellido: rep.apellido,
                  email: rep.usuarios?.email || "",
                  telefono: rep.telefono || ""
                });
                setIsRepresentativeAutofilled(true);
                setStudentForm(prev => ({
                  ...prev,
                  representante_id: rep.id,
                  parentesco: repRelation.parentesco || "Padre"
                }));
              }
            }
          }
        } catch (e) {
          console.error("Error al buscar estudiante:", e);
        }
      } else {
        setLastSearchedStudentCedula("");
        if (isStudentAutofilled) {
          setIsStudentAutofilled(false);
          setStudentForm(prev => ({
            ...prev,
            nombre: "",
            apellido: "",
            fecha_nacimiento: ""
          }));
          // Si el representante también fue autocompletado a través del estudiante, limpiarlo
          if (isRepresentativeAutofilled) {
            setLastSearchedRepCedula("");
            setIsRepresentativeAutofilled(false);
            setRepresentativeForm({
              cedula: "",
              nombre: "",
              apellido: "",
              email: "",
              telefono: ""
            });
            setStudentForm(prev => ({
              ...prev,
              representante_id: ""
            }));
          }
        }
      }
    };
    searchStudent();
  }, [studentForm.cedula, isStudentAutofilled, isRepresentativeAutofilled, lastSearchedStudentCedula]);

  // Buscar representante por cédula
  useEffect(() => {
    const searchRepresentative = async () => {
      const ced = representativeForm.cedula;
      if (ced.length === 10 && validarCedulaEcuatoriana(ced)) {
        if (ced === lastSearchedRepCedula) return;
        setLastSearchedRepCedula(ced);
        try {
          const res = await fetch(`${BACKEND_URL}/familias/buscar/${ced}`);
          if (res.ok) {
            const text = await res.text();
            const data = text ? JSON.parse(text) : null;
            if (data) {
              setRepresentativeForm({
                cedula: data.cedula,
                nombre: data.nombre,
                apellido: data.apellido,
                email: data.email,
                telefono: data.telefono || ""
              });
              setIsRepresentativeAutofilled(true);
              setStudentForm(prev => ({
                ...prev,
                representante_id: data.id
              }));
            }
          }
        } catch (e) {
          console.error("Error al buscar representative:", e);
        }
      } else {
        setLastSearchedRepCedula("");
        if (isRepresentativeAutofilled) {
          setIsRepresentativeAutofilled(false);
          setRepresentativeForm(prev => ({
            ...prev,
            cedula: representativeForm.cedula,
            nombre: "",
            apellido: "",
            email: "",
            telefono: ""
          }));
          setStudentForm(prev => ({
            ...prev,
            representante_id: ""
          }));
        }
      }
    };
    searchRepresentative();
  }, [representativeForm.cedula, isRepresentativeAutofilled, lastSearchedRepCedula]);

  // Cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.replace("/");
  };

  // Crear Grupo Nuevo
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.nombre.trim()) return;

    try {
      const res = await fetch(`${BACKEND_URL}/grupos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user.id || ""
        },
        body: JSON.stringify({
          nombre: groupForm.nombre
        })
      });

      if (!res.ok) throw new Error("Error al registrar el grupo.");

      const data = await res.json();
      setGrupos(prev => [...prev, data]);
      setSelectedGroup(data.id);
      setShowGroupModal(false);
      setGroupForm({ nombre: "" });
      setFeedback({ message: "Grupo registrado exitosamente.", type: "success" });
    } catch (err: any) {
      setFeedback({ message: err.message || "No se pudo registrar el grupo.", type: "error" });
    }
  };

  // Crear estudiante y representante de manera integrada
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGroup) {
      setFeedback({ message: 'Seleccione un grupo antes de crear el estudiante.', type: 'error' });
      return;
    }

    if (!validarCedulaEcuatoriana(studentForm.cedula)) {
      setFeedback({ message: "La cédula del estudiante no es una cédula ecuatoriana válida.", type: 'error' });
      return;
    }

    if (!validarCedulaEcuatoriana(representativeForm.cedula)) {
      setFeedback({ message: "La cédula del representante no es una cédula ecuatoriana válida.", type: 'error' });
      return;
    }

    try {
      let currentRepId = studentForm.representante_id;

      // 1. Si no hay ID de representante, significa que es nuevo y debemos crearlo
      if (!currentRepId) {
        const resFam = await fetch(`${BACKEND_URL}/familias`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cedula: representativeForm.cedula,
            nombre: representativeForm.nombre,
            apellido: representativeForm.apellido,
            email: representativeForm.email,
            telefono: representativeForm.telefono || undefined
          })
        });

        const textFam = await resFam.text();
        let dataFam: any = null;
        try {
          dataFam = textFam ? JSON.parse(textFam) : null;
        } catch {
          dataFam = { message: textFam };
        }

        if (!resFam.ok) {
          throw new Error(dataFam?.message || "Error al registrar el representante.");
        }

        currentRepId = dataFam.id;
      }

      // 2. Registrar el estudiante
      const res = await fetch(`${BACKEND_URL}/estudiantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: studentForm.cedula,
          nombre: studentForm.nombre,
          apellido: studentForm.apellido,
          fecha_nacimiento: studentForm.fecha_nacimiento,
          grupo_id: selectedGroup,
          representante_id: currentRepId || undefined,
          parentesco: studentForm.parentesco
        })
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        throw new Error(data?.message || "Error al registrar el estudiante.");
      }

      setShowStudentModal(false);
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
        telefono: ""
      });
      setIsStudentAutofilled(false);
      setIsRepresentativeAutofilled(false);
      setLastSearchedStudentCedula("");
      setLastSearchedRepCedula("");

      // Recargar estudiantes
      const listRes = await fetch(`${BACKEND_URL}/grupos/${selectedGroup}/estudiantes`);
      const listData = await listRes.json();
      setEstudiantes(listData);
      setFeedback({ message: "Estudiante registrado exitosamente.", type: "success" });
    } catch (err: any) {
      setFeedback({ message: err.message || "No se pudo registrar el alumno.", type: "error" });
    }
  };

  const handleOpenGradeTasksModal = async (est: Estudiante) => {
    setSelectedStudentForTasks(est);
    setShowGradeTasksModal(true);
    setLoadingTasks(true);
    try {
      const res = await fetch(`${BACKEND_URL}/estudiantes/${est.id}/actividades-casa`);
      if (res.ok) {
        const data = await res.json();
        setStudentTasks(data);
      }
    } catch (e) {
      console.error("Error al cargar tareas:", e);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleGradeTask = async (activityId: string, gradeValue: string) => {
    if (!selectedStudentForTasks) return;
    setSavingTaskGradeId(activityId);
    try {
      const res = await fetch(`${BACKEND_URL}/estudiantes/${selectedStudentForTasks.id}/actividades-casa/seguimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actividad_id: activityId,
          nota: gradeValue || null
        })
      });
      if (res.ok) {
        setStudentTasks(prev =>
          prev.map(t => (t.id === activityId ? { ...t, nota: gradeValue || null } : t))
        );
      } else {
        setFeedback({ message: "No se pudo guardar la calificación.", type: "error" });
      }
    } catch (e) {
      console.error("Error al calificar tarea:", e);
      setFeedback({ message: "Error de red al guardar la calificación.", type: "error" });
    } finally {
      setSavingTaskGradeId(null);
    }
  };

  const handleGradeChangeLocal = (activityId: string, val: string) => {
    setStudentTasks(prev =>
      prev.map(t => (t.id === activityId ? { ...t, nota: val } : t))
    );
  };

  const handleSaveGrade = async (activityId: string, gradeValue: string) => {
    if (gradeValue.trim() === "") {
      await handleGradeTask(activityId, "");
      return;
    }
    const gradeNum = parseFloat(gradeValue);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10) {
      setFeedback({ message: "La calificación debe ser un número entre 0 y 10.", type: "error" });
      // Revert local state by reloading tasks
      if (selectedStudentForTasks) {
        const res = await fetch(`${BACKEND_URL}/estudiantes/${selectedStudentForTasks.id}/actividades-casa`);
        if (res.ok) {
          const data = await res.json();
          setStudentTasks(data);
        }
      }
      return;
    }
    await handleGradeTask(activityId, gradeValue);
  };

  // Guardar Planificación de Unidad Didáctica
  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!unitForm.id;
    const url = isEdit ? `${BACKEND_URL}/unidades/${unitForm.id}` : `${BACKEND_URL}/unidades`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user.id || ""
        },
        body: JSON.stringify(unitForm)
      });

      if (!res.ok) throw new Error("Error al guardar planificación.");

      setShowUnitModal(false);
      setUnitForm({
        id: "",
        titulo: "",
        resumen: "",
        ambito: "",
        objetivos_generales: "",
        objetivos_aprendizaje: "",
        destrezas: "",
        semanas_previstas: 1,
        estado: "borrador"
      });

      // Recargar unidades
      const unitsRes = await fetch(`${BACKEND_URL}/docente/unidades`, { headers: { "x-user-id": session?.user.id || "" } });
      const unitsData = await unitsRes.json();
      setUnidades(unitsData);
    } catch (err: any) {
      setFeedback({ message: err.message || "Error al guardar planificación.", type: "error" });
    }
  };

  // Clonar Unidad
  const handleCloneUnit = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/unidades/${id}/clonar`, {
        method: "POST",
        headers: { "x-user-id": session?.user.id || "" }
      });
      if (!res.ok) throw new Error("No se pudo clonar la unidad.");

      const unitsRes = await fetch(`${BACKEND_URL}/docente/unidades`, { headers: { "x-user-id": session?.user.id || "" } });
      const unitsData = await unitsRes.json();
      setUnidades(unitsData);
      setFeedback({ message: "Unidad clonada como borrador.", type: "success" });
    } catch (err: any) {
      setFeedback({ message: err.message || "Error al clonar la unidad.", type: "error" });
    }
  };

  // Agregar Actividad a Unidad
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/unidades/${selectedUnit}/actividades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: activityForm.titulo,
          descripcion: activityForm.descripcion,
          tipo: activityForm.tipo,
          recursos_enlaces: activityForm.recursos
        })
      });

      if (!res.ok) throw new Error("Error al crear actividad.");

      setShowActivityModal(false);
      setActivityForm({ titulo: "", descripcion: "", tipo: "casa", recursos: [] });
      setFeedback({ message: "Actividad añadida con éxito.", type: "success" });

      // Recargar unidades
      const unitsRes = await fetch(`${BACKEND_URL}/docente/unidades`, { headers: { "x-user-id": session?.user.id || "" } });
      const unitsData = await unitsRes.json();
      setUnidades(unitsData);
    } catch (err: any) {
      setFeedback({ message: err.message || "Error al crear la actividad.", type: "error" });
    }
  };

  // Rejilla de evaluaciones
  const handleGradeCriterio = (criterioId: string, nivelId: string) => {
    setEvaluacionesActive((prev) => ({
      ...prev,
      [criterioId]: { ...prev[criterioId], nivelId }
    }));
  };

  const handleGradeObsChange = (criterioId: string, obs: string) => {
    setEvaluacionesActive((prev) => ({
      ...prev,
      [criterioId]: { ...prev[criterioId], obs }
    }));
  };

  const handleSaveEvaluaciones = async () => {
    if (!selectedStudent || !selectedUnit) return;

    const promises = Object.keys(evaluacionesActive).map((critId) => {
      const { nivelId, obs } = evaluacionesActive[critId];
      if (!nivelId) return Promise.resolve();

      return fetch(`${BACKEND_URL}/evaluaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user.id || ""
        },
        body: JSON.stringify({
          estudiante_id: selectedStudent.id,
          criterio_id: critId,
          nivel_logro_id: nivelId,
          unidad_didactica_id: selectedUnit,
          observaciones: obs
        })
      });
    });

    try {
      await Promise.all(promises);
      setFeedback({ message: "Evaluaciones registradas exitosamente.", type: "success" });
      setEvaluacionesActive({});

      // Actualizar gráficos grupales
      const cRes = await fetch(`${BACKEND_URL}/grupos/${selectedGroup}/consolidado`);
      const cData = await cRes.json();
      setMetricasGrupales(cData);
    } catch (err) {
      setFeedback({ message: "Ocurrió un error al guardar las evaluaciones.", type: "error" });
    }
  };

  // Ficha de Monitoreo
  const handleSaveFicha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const res = await fetch(`${BACKEND_URL}/estudiantes/${selectedStudent.id}/ficha-monitoreo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user.id || ""
        },
        body: JSON.stringify(fichaMonitoreo)
      });
      const data = await res.json();
      if (!res.ok) throw new Error("No se pudo guardar la ficha.");

      setFeedback({ message: "Ficha de monitoreo individual guardada exitosamente.", type: "success" });
      setFichaMonitoreo(data);
    } catch (err: any) {
      setFeedback({ message: err.message || "No se pudo guardar la ficha.", type: "error" });
    }
  };

  // Autoevaluación Docente
  const handleSaveAutoevaluacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    const respuestas = Object.keys(autoevaluacionAnswers).map((qNum) => ({
      numero_pregunta: Number(qNum),
      respuesta: autoevaluacionAnswers[Number(qNum)]
    }));

    try {
      const res = await fetch(`${BACKEND_URL}/autoevaluaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user.id || ""
        },
        body: JSON.stringify({
          unidad_didactica_id: selectedUnit,
          reflexion: autoevaluacionReflexion,
          respuestas
        })
      });

      if (!res.ok) throw new Error("Error al guardar autoevaluación.");

      setFeedback({ message: "Autoevaluación guardada exitosamente.", type: "success" });
      setAutoevaluacionReflexion("");
    } catch (err: any) {
      setFeedback({ message: err.message || "Error al guardar autoevaluación.", type: "error" });
    }
  };

  // Descarga del Informe completo
  const handleDownloadInforme = async (estId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/estudiantes/${estId}/informe-completo`);
      const data = await res.json();

      const reportContent = `==================================================================
INFORME DE EVALUACIÓN COGNITIVA INDIVIDUAL
Universidad Técnica del Norte - Carrera de Software
Proyecto Semilleros UTN 2026
==================================================================

ESTUDIANTE: ${data.estudiante.nombre} ${data.estudiante.apellido}
CÉDULA: ${data.estudiante.cedula}
GRUPO: ${data.estudiante.grupos.nombre}
DOCENTE RESPONSABLE: ${data.estudiante.grupos.docentes.nombre} ${data.estudiante.grupos.docentes.apellido}
FECHA DE GENERACIÓN: ${new Date().toLocaleDateString()}

------------------------------------------------------------------
1. HISTORIAL DE EVALUACIONES COGNITIVAS POR CRITERIO
------------------------------------------------------------------
${data.evaluaciones.length === 0
          ? "No se registran evaluaciones cognitivas aún."
          : data.evaluaciones
            .map(
              (ev: any) =>
                `- [${ev.criterios_evaluacion.nombre}]: Logro = ${ev.niveles_logro.nombre} en Unidad: "${ev.unidades_didacticas.titulo}"\n  Observación: ${ev.observaciones || "Sin observación"}\n  Fecha: ${new Date(ev.fecha_evaluacion).toLocaleDateString()}`
            )
            .join("\n\n")
        }

------------------------------------------------------------------
2. FICHA DE MONITOREO CUALITATIVA
------------------------------------------------------------------
${!data.fichaMonitoreo
          ? "No se ha completado la ficha de monitoreo individual."
          : `* Clasificación: ${data.fichaMonitoreo.clasificacion}
* Seriación: ${data.fichaMonitoreo.seriacion}
* Asimilación y Acomodación: ${data.fichaMonitoreo.asimilacion_acomodacion}
* Justificación Lógica: ${data.fichaMonitoreo.justificacion_logica}
* Autorregulación/Metacognición: ${data.fichaMonitoreo.autorregulacion}
* Observaciones del Docente: ${data.fichaMonitoreo.observaciones || "Ninguna"}
* Acciones de Apoyo Recomendadas: ${data.fichaMonitoreo.acciones_apoyo || "Ninguna"}`
        }

------------------------------------------------------------------
3. SEGUIMIENTO DE ACTIVIDADES EN CASA
------------------------------------------------------------------
${data.tareasCasa.length === 0
          ? "No se registran tareas de extensión en casa."
          : data.tareasCasa
            .map(
              (tc: any) =>
                `- Actividad: "${tc.actividades.titulo}"\n  Realizada: ${tc.realizada ? "SÍ" : "NO"}\n  Comentario Familia: ${tc.comentario_familia || "Ninguno"}`
            )
            .join("\n\n")
        }
==================================================================
`;

      const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `informe_cognitivo_${data.estudiante.nombre.toLowerCase()}_${data.estudiante.apellido.toLowerCase()}.txt`;
      link.click();
    } catch (e) {
      setFeedback({ message: "No se pudo descargar el informe.", type: "error" });
    }
  };

  if (loadingSession) {
    return (
      <div className="flex h-screen flex-1 items-center justify-center bg-background text-on-surface-variant font-sans">
        <p className="animate-pulse text-lg font-semibold">Cargando sesión del docente...</p>
      </div>
    );
  }

  const userFullName = `${session?.perfil.nombre ?? ""} ${session?.perfil.apellido ?? ""}`.trim();

  return (
    <DashboardShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      navItems={[...DOCENTE_NAV]}
      userName={userFullName}
      roleLabel="Docente"
      panelSubtitle="Panel Docente"
      onLogout={handleLogout}
    >
      {feedback && (
        <div className="fixed inset-x-0 top-6 z-50 flex justify-center px-4">
          <div
            className="flex items-start gap-3 rounded-3xl border px-4 py-4 bg-surface-container-lowest text-on-surface shadow-xl shadow-black/10 max-w-sm w-full"
            style={{
              borderColor: feedback.type === "success" ? "var(--primary)" : "var(--error)"
            }}
          >
            <span
              className="text-lg"
              style={{ color: feedback.type === "success" ? "var(--primary)" : "var(--error)" }}
            >
              {feedback.type === "success" ? "✅" : "⚠️"}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-surface">
                {feedback.type === "success" ? "¡Listo!" : "Error"}
              </p>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">{feedback.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs font-bold text-on-surface-variant opacity-80 transition hover:opacity-100"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-y-auto">

        {/* TAB 0: INICIO / DASHBOARD DE BIENVENIDA */}
        {activeTab === "inicio" && (
          <DashboardWelcome
            userName={`${session?.perfil.nombre} ${session?.perfil.apellido}`}
            role="docente"
            indicators={[
              {
                icon: "group",
                label: "Estudiantes Matriculados",
                value: estudiantes.length,
                subtitle: "Alumnos registrados en el grupo activo",
                color: "soft-blue",
              },
              {
                icon: "folder",
                label: "Grupos Asignados",
                value: grupos.length,
                subtitle: "Semilleros bajo tu responsabilidad",
                color: "orange",
              },
              {
                icon: "calendar_month",
                label: "Unidades Didácticas",
                value: unidades.length,
                subtitle: "Planificaciones creadas o en curso",
                color: "primary",
              },
              {
                icon: "task",
                label: "Criterios de Evaluación",
                value: criterios.length,
                subtitle: "Criterios disponibles en la rúbrica",
                color: "green",
              },
            ]}
            actions={[
              {
                icon: "person_search",
                label: "Gestionar Alumnos",
                description: "Registra y vincula estudiantes con sus representantes",
                tab: "alumnos",
                color: "soft-blue",
              },
              {
                icon: "edit_calendar",
                label: "Planificación Didáctica",
                description: "Crea unidades didácticas y actividades curriculares",
                tab: "planificacion",
                color: "primary",
              },
              {
                icon: "rule",
                label: "Evaluar Estudiantes",
                description: "Registra evaluaciones cognitivas con la rúbrica",
                tab: "evaluar",
                color: "green",
              },
              {
                icon: "assignment",
                label: "Ficha de Monitoreo",
                description: "Completa fichas cualitativas individuales",
                tab: "monitoreo",
                color: "orange",
              },
              {
                icon: "person_check",
                label: "Autoevaluación Docente",
                description: "Reflexiona sobre tu práctica pedagógica",
                tab: "autoevaluacion",
                color: "secondary",
              },
              {
                icon: "analytics",
                label: "Métricas Colectivas",
                description: "Visualiza el consolidado grupal de desempeño",
                tab: "consolidado",
                color: "tertiary",
              },
            ]}
            onNavigate={setActiveTab}
          />
        )}

        {/* TAB 1: ALUMNOS Y GRUPOS */}
        {activeTab === "alumnos" && (
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
        )}

        {/* TAB 2: PLANIFICACIÓN PEDAGÓGICA */}
        {activeTab === "planificacion" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/30 pb-5">
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface">Planificación de Actividades</h2>
                <p className="text-xs text-on-surface-variant mt-1">Gestiona unidades didácticas y asigna tareas.</p>
              </div>
              <button
                onClick={() => {
                  setUnitForm({ id: "", titulo: "", resumen: "", ambito: "Relaciones lógico-matemáticas", objetivos_generales: "", objetivos_aprendizaje: "", destrezas: "", semanas_previstas: 1, estado: "borrador" });
                  setShowUnitModal(true);
                }}
                className="py-2.5 px-4 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
              >
                + Nueva Unidad Didáctica
              </button>
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
                        <ul className="space-y-1.5 text-xs text-on-surface-variant">
                          {unit.actividades.map((act) => (
                            <li key={act.id} className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${act.tipo === "casa" ? "bg-highlight-orange/10 text-highlight-orange" : "bg-primary/10 text-primary"
                                }`}>
                                {act.tipo}
                              </span>
                              <span className="font-semibold">{act.titulo}</span>
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
                          estado: unit.estado
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
                      onClick={() => {
                        setSelectedUnit(unit.id);
                        setActivityForm({ titulo: "", descripcion: "", tipo: "casa", recursos: [] });
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
        )}

        {/* TAB 3: REJILLA DE EVALUACIÓN */}
        {activeTab === "evaluar" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/30 pb-5">
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface">Registro de Evaluaciones</h2>
                <p className="text-xs text-on-surface-variant mt-1">Evalúa de forma ágil mediante la rúbrica cognitiva.</p>
              </div>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-full sm:w-[250px]"
              >
                <option value="">-- Selecciona Unidad --</option>
                {unidades.filter(u => u.estado === 'activo').map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.titulo}
                  </option>
                ))}
              </select>
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
        )}

        {/* TAB 4: FICHA DE MONITOREO */}
        {activeTab === "monitoreo" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/30 pb-5">
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface">Ficha de Monitoreo Individual</h2>
                <p className="text-xs text-on-surface-variant mt-1">Registra análisis cualitativos de los procesos cognitivos.</p>
              </div>
              <select
                value={selectedStudent?.id || ""}
                onChange={(e) => {
                  const est = estudiantes.find((es) => es.id === e.target.value);
                  if (est) setSelectedStudent(est);
                }}
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-full sm:w-[250px]"
              >
                <option value="">-- Selecciona Estudiante --</option>
                {estudiantes.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.apellido}, {est.nombre}
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent ? (
              <form onSubmit={handleSaveFicha} className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm sm:p-8 space-y-6">
                <h3 className="text-lg font-bold text-on-surface border-b border-outline-variant/20 pb-3">
                  Estudiante: <span className="text-primary">{selectedStudent.nombre} {selectedStudent.apellido}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Clasificación</label>
                    <textarea
                      required
                      value={fichaMonitoreo.clasificacion}
                      onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, clasificacion: e.target.value })}
                      placeholder="Descripción sobre cómo agrupa objetos según atributos (forma, color, etc.)"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Seriación</label>
                    <textarea
                      required
                      value={fichaMonitoreo.seriacion}
                      onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, seriacion: e.target.value })}
                      placeholder="Descripción sobre la habilidad de ordenar elementos de manera secuencial."
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Asimilación y Acomodación</label>
                    <textarea
                      required
                      value={fichaMonitoreo.asimilacion_acomodacion}
                      onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, asimilacion_acomodacion: e.target.value })}
                      placeholder="Descripción de la apropiación y reestructuración de esquemas mentales."
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Justificación Lógica</label>
                    <textarea
                      required
                      value={fichaMonitoreo.justificacion_logica}
                      onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, justificacion_logica: e.target.value })}
                      placeholder="Cómo expresa lógicamente la causa o razón de sus respuestas y acciones."
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Autorregulación</label>
                    <textarea
                      required
                      value={fichaMonitoreo.autorregulacion}
                      onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, autorregulacion: e.target.value })}
                      placeholder="Capacidad del menor de guiar y coordinar sus propias conductas."
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Observaciones del Docente</label>
                    <textarea
                      value={fichaMonitoreo.observaciones || ""}
                      onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, observaciones: e.target.value })}
                      placeholder="Notas adicionales e incidencias observadas."
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Acciones de Apoyo Recomendadas (Para Docente y Familia)</label>
                  <textarea
                    value={fichaMonitoreo.acciones_apoyo || ""}
                    onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, acciones_apoyo: e.target.value })}
                    placeholder="Dinámicas sugeridas de apoyo escolar que deben implementarse en el aula y en casa."
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[80px]"
                  />
                </div>

                <div className="flex justify-end border-t border-outline-variant/20 pt-5 mt-4">
                  <button
                    type="submit"
                    className="py-3 px-6 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
                  >
                    Guardar Ficha de Monitoreo
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl text-center py-20 text-on-surface-variant/80">
                <span className="text-4xl block mb-3">📊</span>
                <p className="text-sm font-bold">Por favor, selecciona un Estudiante para llenar la Ficha de Monitoreo.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AUTOEVALUACIÓN DOCENTE */}
        {activeTab === "autoevaluacion" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/30 pb-5">
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface">Autoevaluación Docente</h2>
                <p className="text-xs text-on-surface-variant mt-1">Reflexiona y evalúa tu práctica en la unidad didáctica.</p>
              </div>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-full sm:w-[250px]"
              >
                <option value="">-- Selecciona Unidad --</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.titulo}
                  </option>
                ))}
              </select>
            </div>

            {selectedUnit ? (
              <form onSubmit={handleSaveAutoevaluacion} className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm sm:p-8 space-y-6">
                <h3 className="text-lg font-bold text-on-surface border-b border-outline-variant/20 pb-3">
                  Formulario Pedagógico de Autoevaluación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { num: 1, text: "1. ¿Las actividades permitieron el desarrollo cognitivo planteado?" },
                    { num: 2, text: "2. ¿Los recursos didácticos facilitaron la asimilación y acomodación?" },
                    { num: 3, text: "3. ¿Las rúbricas aplicadas permitieron medir el logro individual?" },
                    { num: 4, text: "4. ¿El tiempo estipulado para la unidad didáctica fue suficiente?" },
                    { num: 5, text: "5. ¿La comunicación y actividades en casa fueron apoyadas por la familia?" },
                    { num: 6, text: "6. ¿Se implementaron las adecuaciones curriculares necesarias?" }
                  ].map((q) => (
                    <div key={q.num} className="space-y-2">
                      <span className="text-xs font-bold text-on-surface-variant block">{q.text}</span>
                      <select
                        value={autoevaluacionAnswers[q.num]}
                        onChange={(e) => setAutoevaluacionAnswers({ ...autoevaluacionAnswers, [q.num]: e.target.value as any })}
                        className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary w-full"
                      >
                        <option value="SI">Sí</option>
                        <option value="NO">No</option>
                        <option value="EP">En Proceso</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4">
                  <label className="text-xs font-bold text-on-surface-variant block">Reflexión Pedagógica y Propuestas de Mejora</label>
                  <textarea
                    required
                    value={autoevaluacionReflexion}
                    onChange={(e) => setAutoevaluacionReflexion(e.target.value)}
                    placeholder="Escriba sus comentarios reflexivos pedagógicos..."
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary h-[100px]"
                  />
                </div>

                <div className="flex justify-end border-t border-outline-variant/20 pt-5 mt-4">
                  <button
                    type="submit"
                    className="py-3 px-6 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
                  >
                    Registrar Autoevaluación
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl text-center py-20 text-on-surface-variant/80">
                <span className="text-4xl block mb-3">🍎</span>
                <p className="text-sm font-bold">Por favor, selecciona una Unidad para completar tu autoevaluación.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: CONSOLIDADO GRUPAL */}
        {activeTab === "consolidado" && (
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
                    <span><strong>Recomendación de Refuerzo:</strong> El grupo presenta áreas de oportunidad considerables. Se sugiere enfocar esfuerzos and materiales en los criterios con mayor porcentaje en nivel Iniciado.</span>
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
                        <h4 className="text-sm font-bold text-on-surface">{met.criterion}</h4>
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
        )}

      </div>

      {/* ==================================================================
          MODALES (DOCENTE)
          ================================================================== */}

      {/* Modal Agregar Grupo */}
      {showGroupModal && (
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
      )}

      {/* Modal Agregar Alumno */}
      {showStudentModal && (
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
                    telefono: ""
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
                    <label className="text-xs font-bold text-on-surface-variant block">Parentesco con el Representante</label>
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
                      telefono: ""
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
      )}

      {/* Modal Agregar / Editar Unidad Didáctica */}
      {showUnitModal && (
        <div className="ds-modal-overlay fixed inset-0 z-50 flex animate-fade-in items-center justify-center p-4 backdrop-blur-sm">
          {/* 1. Ensanchado el modal con max-w-3xl */}
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
              {/* Contenedor Grid Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Fila 1: Título de la Unidad (Izquierda) */}
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

                {/* Fila 1: Ámbito Cognitivo (Derecha) */}
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

                {/* Fila 2: Resumen Pedagógico (Ocupa todo el ancho) */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-on-surface-variant block">Resumen Pedagógico</label>
                  <textarea
                    placeholder="Resumen del ámbito a evaluar..."
                    value={unitForm.resumen}
                    onChange={(e) => setUnitForm({ ...unitForm, resumen: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary h-[60px]"
                  />
                </div>

                {/* Fila 3: Objetivos Generales (Izquierda) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant block">Objetivos Generales</label>
                  <textarea
                    value={unitForm.objetivos_generales}
                    onChange={(e) => setUnitForm({ ...unitForm, objetivos_generales: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary h-[60px]"
                  />
                </div>

                {/* Fila 3: Objetivos de Aprendizaje (Derecha) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant block">Objetivos de Aprendizaje</label>
                  <textarea
                    value={unitForm.objetivos_aprendizaje}
                    onChange={(e) => setUnitForm({ ...unitForm, objetivos_aprendizaje: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary h-[60px]"
                  />
                </div>

                {/* Fila 4: Destrezas a Evaluar (Izquierda) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant block">Destrezas a Evaluar</label>
                  <textarea
                    value={unitForm.destrezas}
                    onChange={(e) => setUnitForm({ ...unitForm, destrezas: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary h-[116px] resize-none"
                  />
                </div>

                {/* Fila 4: Lado Derecho (Semanas y Estado juntos en una sub-grilla) */}
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

              {/* Botones de acción abajo a la derecha */}
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
      )}

      {/* Modal Agregar Actividad */}
      {showActivityModal && (
        <div className="ds-modal-overlay fixed inset-0 z-50 flex animate-fade-in items-center justify-center p-4 backdrop-blur-sm">
          <div className="ds-modal relative max-w-md w-full space-y-6 p-6 sm:p-8">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-on-surface">Añadir Actividad</h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-on-surface-variant/80 hover:text-on-surface cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Título de la Actividad</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pintar lámina con crayones"
                  value={activityForm.titulo}
                  onChange={(e) => setActivityForm({ ...activityForm, ...activityForm, titulo: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Instrucciones</label>
                <textarea
                  required
                  placeholder="Procedimiento detallado..."
                  value={activityForm.descripcion}
                  onChange={(e) => setActivityForm({ ...activityForm, descripcion: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary h-[80px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block">Tipo de Actividad</label>
                <select
                  value={activityForm.tipo}
                  onChange={(e) => setActivityForm({ ...activityForm, tipo: e.target.value as any })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="clase">En Clase</option>
                  <option value="casa">En Casa (Extensión)</option>
                </select>
              </div>

              {activityForm.tipo === "casa" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant block">Recursos Adicionales</label>
                  <button
                    type="button"
                    onClick={() => {
                      const title = prompt("Nombre del recurso (ej: Vídeo de seriación):");
                      const url = prompt("Enlace web (ej: https://...):");
                      if (title && url) {
                        setActivityForm((prev) => ({
                          ...prev,
                          recursos: [...prev.recursos, { titulo: title, url }]
                        }));
                      }
                    }}
                    className="w-full py-2 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 rounded-xl text-xs font-bold cursor-pointer text-primary"
                  >
                    + Vincular Archivo/Vídeo Enlace
                  </button>
                  <div className="max-h-28 overflow-y-auto space-y-1.5">
                    {activityForm.recursos.map((rec, i) => (
                      <div key={i} className="flex justify-between items-center bg-surface-container-low border border-outline-variant/30 p-2 rounded-lg text-xs">
                        <span className="truncate max-w-[200px] text-on-surface">📄 <strong>{rec.titulo}</strong></span>
                        <button
                          type="button"
                          onClick={() => {
                            setActivityForm((prev) => ({
                              ...prev,
                              recursos: prev.recursos.filter((_, idx) => idx !== i)
                            }));
                          }}
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/20">
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
                  Agregar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Calificar Tareas */}
      {showGradeTasksModal && selectedStudentForTasks && (
        <div className="ds-modal-overlay fixed inset-0 z-50 flex animate-fade-in items-center justify-center p-4 backdrop-blur-sm">
          <div className="ds-modal relative max-w-2xl w-full space-y-6 p-6 sm:p-8">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Calificar Tareas en Casa</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Estudiante: <strong className="text-primary">{selectedStudentForTasks.nombre} {selectedStudentForTasks.apellido}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowGradeTasksModal(false);
                  setSelectedStudentForTasks(null);
                  setStudentTasks([]);
                }}
                className="text-on-surface-variant/80 hover:text-on-surface cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {loadingTasks ? (
              <div className="py-12 text-center text-on-surface-variant/70 text-sm font-semibold animate-pulse">
                Cargando actividades y tareas del estudiante...
              </div>
            ) : studentTasks.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant/70 text-sm font-semibold">
                No hay actividades de casa asignadas para este estudiante en las unidades activas.
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-1">
                {studentTasks.map((task) => (
                  <div key={task.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 space-y-3 shadow-md hover:border-outline-variant/40 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="rounded border border-outline-variant/30 bg-surface-container px-2 py-0.5 text-[9px] font-extrabold uppercase text-on-surface-variant">
                          {task.unidad_titulo}
                        </span>
                        <h4 className="text-sm font-bold text-on-surface mt-1">{task.titulo}</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{task.descripcion}</p>
                      </div>

                      {/* Control de Calificación */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Calificación (0 - 10)</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="Ej: 8.5"
                            value={task.nota !== null && task.nota !== undefined ? task.nota : ""}
                            onChange={(e) => handleGradeChangeLocal(task.id, e.target.value)}
                            onBlur={(e) => handleSaveGrade(task.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="w-24 bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary font-semibold text-center"
                          />
                          {savingTaskGradeId === task.id ? (
                            <span className="text-[10px] text-primary animate-pulse font-bold">...</span>
                          ) : task.nota ? (
                            <span className="text-xs text-green-400 font-bold" title="Guardado exitosamente">✓</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-2 border-t border-outline-variant/10 pt-3 text-[11px] text-on-surface-variant">
                      <div>
                        <span className="font-semibold text-on-surface-variant/80 uppercase block text-[9px]">Cumplimiento:</span>
                        <span className={`font-bold ${task.realizada ? "text-green-400" : "text-amber-400"}`}>
                          {task.realizada ? "✓ Entregada" : "✗ Pendiente"}
                        </span>
                        {task.fecha_realizacion && (
                          <span className="text-[10px] text-on-surface-variant/60 ml-1.5">
                            ({new Date(task.fecha_realizacion).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                      <div className="flex-1 max-w-md sm:text-right">
                        <span className="font-semibold text-on-surface-variant/80 uppercase block text-[9px]">Comentario del Representante:</span>
                        <span className="italic block mt-0.5 truncate text-on-surface">
                          {task.comentario_familia || "Sin comentarios"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => {
                  setShowGradeTasksModal(false);
                  setSelectedStudentForTasks(null);
                  setStudentTasks([]);
                }}
                className="py-2 px-6 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación – reemplaza window.confirm() */}
      <AppModal
        open={!!confirmModal}
        type="confirm"
        variant="danger"
        title="Confirmar acción"
        message={confirmModal?.message ?? ""}
        confirmLabel="Sí, dar de baja"
        cancelLabel="Cancelar"
        onConfirm={() => confirmModal?.onConfirm()}
        onClose={() => setConfirmModal(null)}
      />

    </DashboardShell>
  );
}