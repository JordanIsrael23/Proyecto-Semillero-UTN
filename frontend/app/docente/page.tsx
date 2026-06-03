"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validarCedulaEcuatoriana } from "../utils/validation";
import DashboardWelcome from "../components/DashboardWelcome";
import DashboardShell from "../components/DashboardShell";
import AppModal from "../components/AppModal";

import {
  UsuarioSession,
  Grupo,
  Estudiante,
  UnidadDidactica,
  Criterio,
  NivelLogro,
  FichaMonitoreo,
  MetricaGrupal,
  FamiliaDemo
} from "./types";

import { AlumnosTab } from "./components/AlumnosTab";
import { PlanificacionTab } from "./components/PlanificacionTab";
import { EvaluarTab } from "./components/EvaluarTab";
import { MonitoreoTab } from "./components/MonitoreoTab";
import { AutoevaluacionTab } from "./components/AutoevaluacionTab";
import { ConsolidadoTab } from "./components/ConsolidadoTab";
import { GroupModal } from "./components/GroupModal";
import { StudentModal } from "./components/StudentModal";
import { UnitModal } from "./components/UnitModal";
import { ActivityModal } from "./components/ActivityModal";
import { GradeTasksModal } from "./components/GradeTasksModal";

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
          <AlumnosTab
            estudiantes={estudiantes}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            grupos={grupos}
            setShowGroupModal={setShowGroupModal}
            setShowStudentModal={setShowStudentModal}
            handleOpenGradeTasksModal={handleOpenGradeTasksModal}
            handleDownloadInforme={handleDownloadInforme}
            setConfirmModal={setConfirmModal}
            setFeedback={setFeedback}
            BACKEND_URL={BACKEND_URL}
            setEstudiantes={setEstudiantes}
          />
        )}

        {/* TAB 2: PLANIFICACIÓN PEDAGÓGICA */}
        {activeTab === "planificacion" && (
          <PlanificacionTab
            unidades={unidades}
            setUnitForm={setUnitForm}
            setShowUnitModal={setShowUnitModal}
            handleCloneUnit={handleCloneUnit}
            setSelectedUnit={setSelectedUnit}
            setActivityForm={setActivityForm}
            setShowActivityModal={setShowActivityModal}
          />
        )}

        {/* TAB 3: REJILLA DE EVALUACIÓN */}
        {activeTab === "evaluar" && (
          <EvaluarTab
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            unidades={unidades}
            estudiantes={estudiantes}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            handleSaveEvaluaciones={handleSaveEvaluaciones}
            criterios={criterios}
            evaluacionesActive={evaluacionesActive}
            niveles={niveles}
            handleGradeCriterio={handleGradeCriterio}
            handleGradeObsChange={handleGradeObsChange}
          />
        )}

        {/* TAB 4: FICHA DE MONITOREO */}
        {activeTab === "monitoreo" && (
          <MonitoreoTab
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            estudiantes={estudiantes}
            fichaMonitoreo={fichaMonitoreo}
            setFichaMonitoreo={setFichaMonitoreo}
            handleSaveFicha={handleSaveFicha}
          />
        )}

        {/* TAB 5: AUTOEVALUACIÓN DOCENTE */}
        {activeTab === "autoevaluacion" && (
          <AutoevaluacionTab
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            unidades={unidades}
            autoevaluacionAnswers={autoevaluacionAnswers}
            setAutoevaluacionAnswers={setAutoevaluacionAnswers}
            autoevaluacionReflexion={autoevaluacionReflexion}
            setAutoevaluacionReflexion={setAutoevaluacionReflexion}
            handleSaveAutoevaluacion={handleSaveAutoevaluacion}
          />
        )}

        {/* TAB 6: CONSOLIDADO GRUPAL */}
        {activeTab === "consolidado" && (
          <ConsolidadoTab
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            grupos={grupos}
            metricasGrupales={metricasGrupales}
          />
        )}

      </div>

      {/* ==================================================================
          MODALES (DOCENTE)
          ================================================================== */}

      {/* Modal Agregar Grupo */}
      <GroupModal
        showGroupModal={showGroupModal}
        setShowGroupModal={setShowGroupModal}
        groupForm={groupForm}
        setGroupForm={setGroupForm}
        handleCreateGroup={handleCreateGroup}
      />

      {/* Modal Agregar Alumno */}
      <StudentModal
        showStudentModal={showStudentModal}
        setShowStudentModal={setShowStudentModal}
        isStudentAutofilled={isStudentAutofilled}
        setIsStudentAutofilled={setIsStudentAutofilled}
        isRepresentativeAutofilled={isRepresentativeAutofilled}
        setIsRepresentativeAutofilled={setIsRepresentativeAutofilled}
        studentForm={studentForm}
        setStudentForm={setStudentForm}
        representativeForm={representativeForm}
        setRepresentativeForm={setRepresentativeForm}
        setLastSearchedStudentCedula={setLastSearchedStudentCedula}
        setLastSearchedRepCedula={setLastSearchedRepCedula}
        handleCreateStudent={handleCreateStudent}
      />

      {/* Modal Agregar / Editar Unidad Didáctica */}
      <UnitModal
        showUnitModal={showUnitModal}
        setShowUnitModal={setShowUnitModal}
        unitForm={unitForm}
        setUnitForm={setUnitForm}
        handleSaveUnit={handleSaveUnit}
      />

      {/* Modal Agregar Actividad */}
      <ActivityModal
        showActivityModal={showActivityModal}
        setShowActivityModal={setShowActivityModal}
        activityForm={activityForm}
        setActivityForm={setActivityForm}
        handleCreateActivity={handleCreateActivity}
      />

      {/* Modal Calificar Tareas */}
      <GradeTasksModal
        showGradeTasksModal={showGradeTasksModal}
        setShowGradeTasksModal={setShowGradeTasksModal}
        selectedStudentForTasks={selectedStudentForTasks}
        setSelectedStudentForTasks={setSelectedStudentForTasks}
        studentTasks={studentTasks}
        setStudentTasks={setStudentTasks}
        loadingTasks={loadingTasks}
        savingTaskGradeId={savingTaskGradeId}
        handleGradeChangeLocal={handleGradeChangeLocal}
        handleSaveGrade={handleSaveGrade}
      />

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